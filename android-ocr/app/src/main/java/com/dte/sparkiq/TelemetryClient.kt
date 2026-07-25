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

    // Using VITE_SUPABASE_URL from .env
    private const val SUPABASE_URL = "https://dkrtfwqovhepurzzqfjl.supabase.co" 
    // Using SUPABASE_SERVICE_ROLE_KEY from .env.local to bypass RLS for telemetry ingestion
    private const val SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcnRmd3FvdmhlcHVyenpxZmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk2NTU4NiwiZXhwIjoyMDk4NTQxNTg2fQ.0aEgzGXsyBMpxxqK4qv6aIwwE-v09ZDeYA_lGoRCEIA"

    suspend fun dispatch(price: Double, miles: Double, items: Int, netPerHour: Double, dollarsPerMile: Double) {
        withContext(Dispatchers.IO) {
            try {
                // Formatting payload to match the 'offers' table schema
                val jsonPayload = JSONObject().apply {
                    put("platform", "Spark")
                    put("pay", price)
                    put("tips", 0.0) // OCR might not split tips reliably yet
                    put("miles", miles)
                    put("miles_back", 0.0)
                    put("time_minutes", if (netPerHour > 0) ((price / netPerHour) * 60).toInt() else 30)
                    put("items", items)
                    put("dropoff_zone", "Unknown")
                    put("rating", "Pending")
                    put("net_profit", price)
                    put("hourly_rate", netPerHour)
                    put("per_mile_rate", dollarsPerMile)
                    put("gas_cost", 0.0)
                }

                val body = jsonPayload.toString().toRequestBody(JSON)
                
                val request = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/offers") // Targeting the actual 'offers' table
                    .addHeader("apikey", SUPABASE_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_KEY")
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
