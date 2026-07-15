package com.dte.sparkiq

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import android.widget.LinearLayout
import android.graphics.drawable.GradientDrawable

class BubbleOverlayView(private val context: Context) {
    private val windowManager: WindowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: View? = null
    
    // Lux Forest Aesthetic Colors
    private val colorCharcoal = Color.parseColor("#1a1a1a")
    private val colorKineticGreen = Color.parseColor("#00ff00")
    private val colorRed = Color.parseColor("#ff3333")

    fun showBubble(netPerHour: Double, dollarsPerMile: Double, isValid: Boolean) {
        if (overlayView != null) {
            updateBubble(netPerHour, dollarsPerMile, isValid)
            return
        }

        val layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )

        layoutParams.gravity = Gravity.TOP or Gravity.START
        layoutParams.x = 100
        layoutParams.y = 200

        overlayView = createView(netPerHour, dollarsPerMile, isValid)
        setupDragListener(overlayView!!, layoutParams)
        
        windowManager.addView(overlayView, layoutParams)
    }

    private fun updateBubble(netPerHour: Double, dollarsPerMile: Double, isValid: Boolean) {
        overlayView?.let { view ->
            val tvMetric = view.findViewById<TextView>(android.R.id.text1)
            val formatString = if (isValid) "+$${String.format("%.2f", netPerHour)}/hr Net" else "Bogus Order"
            tvMetric.text = formatString
            
            val background = view.background as GradientDrawable
            if (isValid && netPerHour >= 20.0) {
                tvMetric.setTextColor(colorCharcoal)
                background.setColor(colorKineticGreen) // High Value
            } else {
                tvMetric.setTextColor(Color.WHITE)
                background.setColor(colorRed) // Low Value / Bogus
            }
        }
    }

    private fun createView(netPerHour: Double, dollarsPerMile: Double, isValid: Boolean): View {
        val container = LinearLayout(context)
        container.orientation = LinearLayout.VERTICAL
        container.setPadding(32, 16, 32, 16)
        
        val background = GradientDrawable()
        background.shape = GradientDrawable.RECTANGLE
        background.cornerRadius = 50f
        
        val tvMetric = TextView(context)
        tvMetric.id = android.R.id.text1
        tvMetric.textSize = 16f
        tvMetric.setTypeface(null, android.graphics.Typeface.BOLD)
        
        container.background = background
        container.addView(tvMetric)
        
        return container
    }

    private fun setupDragListener(view: View, layoutParams: WindowManager.LayoutParams) {
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        view.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = layoutParams.x
                    initialY = layoutParams.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    layoutParams.x = initialX + (event.rawX - initialTouchX).toInt()
                    layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager.updateViewLayout(view, layoutParams)
                    true
                }
                else -> false
            }
        }
    }

    fun removeBubble() {
        overlayView?.let {
            windowManager.removeView(it)
            overlayView = null
        }
    }
}
