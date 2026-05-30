package com.brick.bondwatch

import android.app.Application
import android.os.SystemClock
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Calendar
import kotlin.math.ceil
import kotlin.math.max

class WorkoutViewModel(app: Application) : AndroidViewModel(app) {

    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    var session by mutableStateOf<Session?>(null); private set

    var started by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    var exIndex by mutableStateOf(0); private set
    var setIndex by mutableStateOf(0); private set

    var resting by mutableStateOf(false); private set
    var restTotal by mutableStateOf(0); private set
    var restLeft by mutableStateOf(0); private set

    private var restEnd = 0L
    private var tickJob: Job? = null

    val currentExercise: Exercise?
        get() = session?.exercises?.getOrNull(exIndex)

    private fun localWeekday(): Int {
        val dow = Calendar.getInstance().get(Calendar.DAY_OF_WEEK) // 1=Dim..7=Sam
        return (dow + 5) % 7 // -> 0=Lun .. 6=Dim
    }

    fun load() {
        loading = true; error = null
        viewModelScope.launch {
            try {
                session = Api.fetchToday(localWeekday())
            } catch (e: Exception) {
                error = "Connexion impossible. Vérifie le Wi-Fi de la montre."
            } finally {
                loading = false
            }
        }
    }

    fun start() {
        val s = session ?: return
        if (s.rest || s.exercises.isEmpty()) return
        started = true; done = false; exIndex = 0; setIndex = 0
        stopRest()
    }

    fun validateSet() {
        val s = session ?: return
        val ex = s.exercises.getOrNull(exIndex) ?: return
        val lastSet = setIndex >= ex.sets - 1
        val lastEx = exIndex >= s.exercises.size - 1
        if (lastSet && lastEx) {
            stopRest(); done = true; return
        }
        if (lastSet) { exIndex += 1; setIndex = 0 } else { setIndex += 1 }
        startRest(ex.rest)
    }

    fun startRest(seconds: Int) {
        if (seconds <= 0) return
        restTotal = seconds
        restEnd = SystemClock.elapsedRealtime() + seconds * 1000L
        restLeft = seconds
        resting = true
        // Vibration de fin garantie même écran éteint :
        RestAlarm.schedule(getApplication(), System.currentTimeMillis() + seconds * 1000L)
        tickJob?.cancel()
        tickJob = viewModelScope.launch {
            while (resting) {
                val remainMs = restEnd - SystemClock.elapsedRealtime()
                if (remainMs <= 0) { resting = false; restLeft = 0; break }
                restLeft = max(0, ceil(remainMs / 1000.0).toInt())
                delay(300)
            }
        }
    }

    fun addRest(seconds: Int) {
        if (!resting) return
        restEnd += seconds * 1000L
        restTotal += seconds
        RestAlarm.cancel(getApplication())
        RestAlarm.schedule(getApplication(), System.currentTimeMillis() + (restEnd - SystemClock.elapsedRealtime()))
    }

    fun skipRest() { stopRest() }

    private fun stopRest() {
        resting = false
        tickJob?.cancel(); tickJob = null
        RestAlarm.cancel(getApplication())
    }

    fun restart() {
        stopRest(); started = false; done = false; exIndex = 0; setIndex = 0
    }

    override fun onCleared() {
        super.onCleared()
        tickJob?.cancel()
    }
}
