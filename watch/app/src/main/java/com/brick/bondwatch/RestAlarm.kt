package com.brick.bondwatch

import android.app.AlarmManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.PendingIntent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

private fun vibrator(ctx: Context): Vibrator =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        (ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        ctx.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

// Vibration forte de fin de repos — fonctionne MÊME écran éteint (déclenchée
// par AlarmManager) et au premier plan (appelée par le ViewModel).
fun vibrateEnd(ctx: Context) {
    val pattern = longArrayOf(0, 500, 250, 600, 250, 800)
    vibrator(ctx).vibrate(VibrationEffect.createWaveform(pattern, -1))
}

// Petit retour haptique (validation d'une série).
fun vibrateClick(ctx: Context) {
    vibrator(ctx).vibrate(VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE))
}

class RestAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        vibrateEnd(context)
    }
}

object RestAlarm {
    private const val REQ = 4242

    private fun pending(ctx: Context): PendingIntent {
        val intent = Intent(ctx, RestAlarmReceiver::class.java)
        return PendingIntent.getBroadcast(
            ctx, REQ, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun schedule(ctx: Context, atMillis: Long) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        try {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, atMillis, pending(ctx))
        } catch (_: SecurityException) {
            am.set(AlarmManager.RTC_WAKEUP, atMillis, pending(ctx))
        }
    }

    fun cancel(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(pending(ctx))
    }
}
