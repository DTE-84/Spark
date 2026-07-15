package com.dte.sparkiq

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityService.ScreenshotResult
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.ColorSpace
import android.hardware.HardwareBuffer
import android.os.Build
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import androidx.annotation.RequiresApi
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SparkAccessibilityService : AccessibilityService() {

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    private val scope = CoroutineScope(Dispatchers.IO)
    private var isProcessing = false

    private var bubbleOverlayView: BubbleOverlayView? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("SparkIQ_OCR", "Accessibility Service Connected: Interceptor Active")
        // Initialize Overlay Manager on main thread
        kotlinx.coroutines.MainScope().launch {
            bubbleOverlayView = BubbleOverlayView(this@SparkAccessibilityService)
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        
        // Listen for window state changes or content updates (when a gig offer appears)
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED || 
            event.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
            
            val packageName = event.packageName?.toString() ?: return
            
            if (packageName.contains("sparkdriver", ignoreCase = true)) {
                if (!isProcessing) {
                    Log.d("SparkIQ_OCR", "Gig App Foregrounded: $packageName. Initiating silent capture.")
                    captureAndProcessScreen()
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.w("SparkIQ_OCR", "Accessibility Service Interrupted")
        kotlinx.coroutines.MainScope().launch {
            bubbleOverlayView?.removeBubble()
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun captureAndProcessScreen() {
        isProcessing = true
        takeScreenshot(
            Display.DEFAULT_DISPLAY,
            mainExecutor,
            object : TakeScreenshotCallback {
                override fun onSuccess(screenshot: ScreenshotResult) {
                    Log.d("SparkIQ_OCR", "Silent screenshot captured.")
                    processScreenshot(screenshot)
                }

                override fun onFailure(errorCode: Int) {
                    Log.e("SparkIQ_OCR", "Failed to capture screenshot. Error: $errorCode")
                    isProcessing = false
                }
            }
        )
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun processScreenshot(screenshot: ScreenshotResult) {
        val hardwareBuffer = screenshot.hardwareBuffer
        val colorSpace = screenshot.colorSpace
        
        // Convert HardwareBuffer to Bitmap for ML Kit
        val bitmap = Bitmap.wrapHardwareBuffer(hardwareBuffer, colorSpace)
        if (bitmap == null) {
            isProcessing = false
            return
        }

        val image = InputImage.fromBitmap(bitmap, 0)
        
        recognizer.process(image)
            .addOnSuccessListener { visionText ->
                hardwareBuffer.close()
                scope.launch {
                    analyzeTextForMetrics(visionText.text)
                }
            }
            .addOnFailureListener { e ->
                hardwareBuffer.close()
                Log.e("SparkIQ_OCR", "ML Kit OCR Failed", e)
                isProcessing = false
            }
    }

    private suspend fun analyzeTextForMetrics(rawText: String) {
        withContext(Dispatchers.Default) {
            Log.d("SparkIQ_OCR", "Raw OCR Extracted Text:\n$rawText")
            
            // Edge Processor Logic: High-Fidelity Surgical Pattern Matching
            // Price: Matches "$22.50", "$ 22.50", (handling potential commas like "1,022.50")
            val priceRegex = Regex("\\\$?\\s*([0-9]{1,3}(?:,[0-9]{3})*\\.[0-9]{2})")
            
            // Miles: Matches "8.2 miles", "8 mi", "8.2mi"
            val milesRegex = Regex("([0-9]+(?:\\.[0-9]+)?)\\s*(?:miles?|mi\\b)", RegexOption.IGNORE_CASE)
            
            // Items/Stops: Matches "4 items", "4 stops", "4 orders"
            val itemsRegex = Regex("([0-9]+)\\s*(?:items?|stops?|orders?)", RegexOption.IGNORE_CASE)

            // Extract the first matches. Sanitize strings (remove commas) before casting to maintain Data Integrity.
            val priceStr = priceRegex.find(rawText)?.groupValues?.get(1)?.replace(",", "")
            val priceMatch = priceStr?.toDoubleOrNull()
            
            val milesMatch = milesRegex.find(rawText)?.groupValues?.get(1)?.toDoubleOrNull()
            val itemsMatch = itemsRegex.find(rawText)?.groupValues?.get(1)?.toIntOrNull()

            if (priceMatch != null && milesMatch != null && milesMatch > 0) {
                val netPerHour = (priceMatch / milesMatch) * 20.0 // Assuming roughly 20 miles driven in an hour as a basic heuristic, or a standard formula
                val dollarsPerMile = priceMatch / milesMatch
                
                Log.d("SparkIQ_OCR", "High-Fidelity Telemetry Extracted: Price=$priceMatch, Miles=$milesMatch, Items=$itemsMatch")
                Log.d("SparkIQ_OCR", "Calculated Logic: $/Mile=$dollarsPerMile")

                // Invoke BubbleOverlayView with calculated metrics on Main Thread
                withContext(Dispatchers.Main) {
                    val isValid = netPerHour >= 20.0
                    bubbleOverlayView?.showBubble(netPerHour, dollarsPerMile, isValid)
                    
                    // After 5 seconds, clear the bubble to keep the UI clean
                    kotlinx.coroutines.delay(5000)
                    bubbleOverlayView?.removeBubble()
                }

                // Dispatch telemetry payload to Supabase Edge
                TelemetryClient.dispatch(priceMatch, milesMatch, itemsMatch ?: 0, netPerHour, dollarsPerMile)
            }
            isProcessing = false
        }
    }
}
