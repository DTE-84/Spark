package com.dte.sparkiq

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

object TelemetryClient {
    private val client = OkHttpClient()
    private val JSON = "application/json; charset=utf-8".toMediaType()

    // TODO: Inject from BuildConfig in production
    private const val SUPABASE_URL = "YOUR_SUPABASE_URL_HERE" 
    private const val SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE"

    suspend fun dispatch(price: Double, miles: Double, items: Int, netPerHour: Double, dollarsPerMile: Double) {
        withContext(Dispatchers.IO) {
            try {
                val jsonPayload = JSONObject().apply {
                    put("price", price)
                    put("miles", miles)
                    put("items", items)
                    put("net_per_hour", netPerHour)
                    put("dollars_per_mile", dollarsPerMile)
                    put("source", "android_ocr")
                }

                val body = jsonPayload.toString().toRequestBody(JSON)
                
                val request = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/spark_offers") // Assuming a table named spark_offers
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Prefer", "return=minimal")
                    .post(body)
                    .build()

                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    Log.d("SparkIQ_OCR", "Telemetry Uplink Successful. Data integrity secured.")
                } else {
                    Log.e("SparkIQ_OCR", "Telemetry Uplink Failed: ${response.code} ${response.message}")
                }
                response.close()
            } catch (e: Exception) {
                Log.e("SparkIQ_OCR", "Exception during Telemetry Uplink", e)
            }
        }
    }
}
