package com.brick.bondwatch

import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors

// Direction artistique claire + accent orange (cohérente avec l'app téléphone).
val BondColors = Colors(
    primary = Color(0xFFFF7A4D),          // orange (boutons)
    primaryVariant = Color(0xFFE8551F),
    secondary = Color(0xFFFF7A4D),
    secondaryVariant = Color(0xFFE8551F),
    background = Color(0xFFF3F6F4),        // fond clair
    surface = Color(0xFFFFFFFF),          // cartes / chips blancs
    error = Color(0xFFFF5A7A),
    onPrimary = Color(0xFF231007),        // texte foncé sur l'orange
    onSecondary = Color(0xFF231007),
    onBackground = Color(0xFF0E1A14),     // texte foncé sur fond clair
    onSurface = Color(0xFF0E1A14),
    onSurfaceVariant = Color(0xFF5E6E66),
    onError = Color(0xFFFFFFFF),
)
