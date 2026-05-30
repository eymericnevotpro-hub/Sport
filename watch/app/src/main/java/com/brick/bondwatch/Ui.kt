package com.brick.bondwatch

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText

private val Mint = androidx.compose.ui.graphics.Color(0xFFE8551F) // orange foncé, lisible sur fond clair

@Composable
fun BondApp(vm: WorkoutViewModel) {
    Scaffold(timeText = { TimeText() }) {
        when {
            vm.loading -> Centered { CircularProgressIndicator() }
            vm.error != null -> ErrorScreen(vm)
            vm.session?.rest == true -> Centered {
                Text("Repos 💤", style = MaterialTheme.typography.title2)
                Text("Pas de séance aujourd'hui", style = MaterialTheme.typography.caption2, textAlign = TextAlign.Center)
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
    Text(vm.error ?: "Erreur", textAlign = TextAlign.Center, style = MaterialTheme.typography.body2)
    Spacer(Modifier.height(8.dp))
    Button(onClick = { vm.load() }) { Text("Réessayer") }
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
                Text(s.title, style = MaterialTheme.typography.title3, textAlign = TextAlign.Center)
                Text("${s.exercises.size} exos", style = MaterialTheme.typography.caption2, color = Mint)
            }
        }
        item {
            Button(onClick = { vm.start() }, modifier = Modifier.fillMaxWidth(0.9f)) {
                Text("Commencer ▶")
            }
        }
        items(s.exercises) { ex ->
            Chip(
                onClick = { },
                modifier = Modifier.fillMaxWidth(),
                colors = ChipDefaults.secondaryChipColors(),
                label = { Text(ex.name, maxLines = 2) },
                secondaryLabel = { Text("${ex.sets}×${ex.reps}" + if (ex.weight > 0) " · ${fmtKg(ex.weight)}" else "") }
            )
        }
    }
}

@Composable
private fun ActiveScreen(vm: WorkoutViewModel) {
    val ex = vm.currentExercise ?: return
    Centered {
        Text("Exo ${vm.exIndex + 1}/${vm.session?.exercises?.size ?: 0}", style = MaterialTheme.typography.caption2, color = Mint)
        Text(ex.name, style = MaterialTheme.typography.title3, textAlign = TextAlign.Center, maxLines = 2)
        Spacer(Modifier.height(4.dp))
        Text("Série ${vm.setIndex + 1} / ${ex.sets}", style = MaterialTheme.typography.body1)
        Text("${ex.reps} reps" + if (ex.weight > 0) " · ${fmtKg(ex.weight)}" else " · PdC", style = MaterialTheme.typography.caption1, color = Mint)
        Spacer(Modifier.height(10.dp))
        Button(onClick = { vm.validateSet() }, modifier = Modifier.fillMaxWidth(0.9f)) {
            Text("Valider ✓")
        }
    }
}

@Composable
private fun RestScreen(vm: WorkoutViewModel) {
    Centered {
        Text("REPOS", style = MaterialTheme.typography.caption1, color = Mint)
        Text(fmtTime(vm.restLeft), fontSize = 46.sp, style = MaterialTheme.typography.display1)
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { vm.addRest(15) }, colors = androidx.wear.compose.material.ButtonDefaults.secondaryButtonColors()) { Text("+15s") }
            Button(onClick = { vm.skipRest() }) { Text("Passer") }
        }
        Spacer(Modifier.height(4.dp))
        vm.currentExercise?.let {
            Text("À suivre : ${it.name}", style = MaterialTheme.typography.caption3, textAlign = TextAlign.Center, maxLines = 2)
        }
    }
}

@Composable
private fun DoneScreen(vm: WorkoutViewModel) = Centered {
    Text("Séance terminée 💪", style = MaterialTheme.typography.title3, textAlign = TextAlign.Center)
    Spacer(Modifier.height(10.dp))
    Button(onClick = { vm.restart() }) { Text("Recommencer") }
}

private fun fmtTime(sec: Int): String {
    val m = sec / 60; val s = sec % 60
    return "%d:%02d".format(m, s)
}
private fun fmtKg(w: Double): String =
    (if (w % 1.0 == 0.0) w.toInt().toString() else w.toString()).replace(".", ",") + " kg"
