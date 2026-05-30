package com.brick.bondwatch

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class Exercise(
    val name: String,
    val sets: Int,
    val reps: Int,
    val weight: Double,
    val rest: Int,
)

data class Session(
    val title: String,
    val rest: Boolean,
    val program: String,
    val exercises: List<Exercise>,
)

object Api {
    // Même backend que l'app web : les données viennent du compte en ligne.
    private const val BASE = "https://sport-solo.vercel.app"

    suspend fun fetchToday(weekday: Int): Session = withContext(Dispatchers.IO) {
        val conn = (URL("$BASE/api/today?weekday=$weekday").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 15000
            readTimeout = 15000
        }
        try {
            val text = conn.inputStream.bufferedReader().use { it.readText() }
            val o = JSONObject(text)
            val list = mutableListOf<Exercise>()
            o.optJSONArray("exercises")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val e = arr.getJSONObject(i)
                    list.add(
                        Exercise(
                            name = e.optString("name", "Exercice"),
                            sets = e.optInt("sets", 3),
                            reps = e.optInt("reps", 12),
                            weight = e.optDouble("weight", 0.0),
                            rest = e.optInt("rest", 75),
                        )
                    )
                }
            }
            Session(
                title = o.optString("title", "Séance"),
                rest = o.optBoolean("rest", false),
                program = o.optString("program", ""),
                exercises = list,
            )
        } finally {
            conn.disconnect()
        }
    }
}
