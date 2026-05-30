package com.brick.bondwatch

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText

// Couleurs explicites (pas de dépendance au content-color par défaut).
private val Orange = Color(0xFFE8551F) // accent lisible sur fond clair
private val Ink = Color(0xFF0E1A14)     // texte principal foncé
private val Ink2 = Color(0xFF5E6E66)    // texte secondaire

@Composable
fun BondApp(vm: WorkoutViewModel) {
    Scaffold(timeText = { TimeText() }) {
        when {
            vm.loading -> Centered { CircularProgressIndicator() }
            vm.error != null -> ErrorScreen(vm)
            vm.session?.rest == true -> Centered {
                Text("Repos 💤", color = Ink, style = MaterialTheme.typography.title2)
                Text("Pas de séance aujourd'hui", color = Ink2, style = MaterialTheme.typography.caption2, textAlign = TextAlign.Center)
            }
            vm.done -> DoneScreen(vm)
            vm.resting -> RestScreen(vm)
            !vm.started -> OverviewScreen(vm)
            else -> ActiveScreen(vm)
        }
    }
}

@Composable
private fun Centered(content: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) { content() }
    }
}

@Composable
private fun ErrorScreen(vm: WorkoutViewModel) = Centered {
    Text(vm.error ?: "Erreur", color = Ink, textAlign = TextAlign.Center, style = MaterialTheme.typography.body2)
    Spacer(Modifier.height(8.dp))
    Button(onClick = { vm.load() }) { Text("Réessayer", color = Color(0xFF231007)) }
}

@Composable
private fun OverviewScreen(vm: WorkoutViewModel) {
    val s = vm.session ?: return
    val state = rememberScalingLazyListState()
    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = state,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        item {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(s.title, color = Ink, style = MaterialTheme.typography.title3, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                Text("${s.exercises.size} exos", color = Orange, style = MaterialTheme.typography.caption2, fontWeight = FontWeight.Bold)
            }
        }
        item {
            Button(onClick = { vm.start() }, modifier = Modifier.fillMaxWidth(0.9f)) {
                Text("Commencer ▶", color = Color(0xFF231007), fontWeight = FontWeight.Bold)
            }
        }
        items(s.exercises) { ex ->
            Chip(
                onClick = { },
                modifier = Modifier.fillMaxWidth(),
                colors = ChipDefaults.secondaryChipColors(),
                label = { Text(ex.name, color = Ink, maxLines = 2) },
                secondaryLabel = { Text("${ex.sets}×${ex.reps}" + if (ex.weight > 0) " · ${fmtKg(ex.weight)}" else "", color = Ink2) }
            )
        }
    }
}

@Composable
private fun ActiveScreen(vm: WorkoutViewModel) {
    val ex = vm.currentExercise ?: return
    Centered {
        Text("Exo ${vm.exIndex + 1}/${vm.session?.exercises?.size ?: 0}", color = Orange, style = MaterialTheme.typography.caption2, fontWeight = FontWeight.Bold)
        Text(ex.name, color = Ink, style = MaterialTheme.typography.title3, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, maxLines = 3)
        Spacer(Modifier.height(4.dp))
        Text("Série ${vm.setIndex + 1} / ${ex.sets}", color = Ink, style = MaterialTheme.typography.body1, fontWeight = FontWeight.Bold)
        Text("${ex.reps} reps" + if (ex.weight > 0) " · ${fmtKg(ex.weight)}" else " · PdC", color = Orange, style = MaterialTheme.typography.caption1, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(10.dp))
        Button(onClick = { vm.validateSet() }, modifier = Modifier.fillMaxWidth(0.9f)) {
            Text("Valider ✓", color = Color(0xFF231007), fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun RestScreen(vm: WorkoutViewModel) {
    Centered {
        Text("REPOS", color = Orange, style = MaterialTheme.typography.caption1, fontWeight = FontWeight.Bold)
        Text(fmtTime(vm.restLeft), color = Ink, fontSize = 48.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { vm.addRest(15) }, colors = ButtonDefaults.secondaryButtonColors()) { Text("+15s", color = Ink) }
            Button(onClick = { vm.skipRest() }) { Text("Passer", color = Color(0xFF231007), fontWeight = FontWeight.Bold) }
        }
        Spacer(Modifier.height(4.dp))
        vm.currentExercise?.let {
            Text("À suivre : ${it.name}", color = Ink2, style = MaterialTheme.typography.caption3, textAlign = TextAlign.Center, maxLines = 2)
        }
    }
}

@Composable
private fun DoneScreen(vm: WorkoutViewModel) = Centered {
    Text("Séance terminée 💪", color = Ink, style = MaterialTheme.typography.title3, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
    Spacer(Modifier.height(10.dp))
    Button(onClick = { vm.restart() }) { Text("Recommencer", color = Color(0xFF231007), fontWeight = FontWeight.Bold) }
}

private fun fmtTime(sec: Int): String {
    val m = sec / 60; val s = sec % 60
    return "%d:%02d".format(m, s)
}
private fun fmtKg(w: Double): String =
    (if (w % 1.0 == 0.0) w.toInt().toString() else w.toString()).replace(".", ",") + " kg"
