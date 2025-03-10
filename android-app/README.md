# Dictaphone Android App

Application de dictaphone avec transcription audio utilisant Jetpack Compose et l'API Whisper d'OpenAI.

## Fonctionnalités

- Enregistrement audio avec visualisation de la forme d'onde en temps réel
- Transcription automatique via Whisper API
- Interface Material Design 3 avec support du mode sombre
- Gestion des permissions Android 13+
- Stockage local des enregistrements

## Prérequis

- Android Studio Hedgehog (2023.1.1) ou plus récent
- JDK 17
- Android SDK 34
- Clé API OpenAI pour Whisper

## Configuration

1. Clonez le projet
2. Ouvrez-le dans Android Studio
3. Configurez votre clé API OpenAI :
   - Ouvrez les paramètres de l'application
   - Dans la section "Paramètres API", entrez votre clé API OpenAI

## Build & Run

1. Synchronisez le projet avec Gradle
2. Connectez un appareil Android ou démarrez un émulateur
3. Exécutez l'application via Android Studio

## Architecture

- **UI**: Jetpack Compose avec Material 3
- **État**: ViewModel + StateFlow
- **Injection de dépendances**: Hilt
- **Audio**: MediaRecorder & MediaPlayer APIs
- **API**: Retrofit pour les appels à Whisper
- **Permissions**: API Permissions Android moderne

## Structure du Projet

```
app/
├── src/
│   └── main/
│       ├── java/com/dictaphone/
│       │   ├── data/
│       │   │   ├── api/        # Services API (Whisper)
│       │   │   └── audio/      # Gestion audio
│       │   ├── di/             # Injection de dépendances
│       │   ├── domain/
│       │   │   └── model/      # Modèles de données
│       │   ├── ui/
│       │   │   ├── components/ # Composants réutilisables
│       │   │   ├── screens/    # Écrans de l'application
│       │   │   └── theme/      # Thème Material 3
│       │   └── util/           # Utilitaires
│       └── res/                # Ressources Android
└── build.gradle               # Configuration du build
```

## Permissions Requises

- `RECORD_AUDIO`: Pour l'enregistrement audio
- `INTERNET`: Pour la transcription via Whisper API
- `READ/WRITE_EXTERNAL_STORAGE`: Pour le stockage des enregistrements (Android < 13)

## Développement

### Ajouter un nouvel écran

1. Créez un nouveau package dans `ui/screens/`
2. Ajoutez les composants Compose nécessaires
3. Créez un ViewModel si nécessaire
4. Ajoutez la route dans le NavHost de MainActivity

### Modifier les styles

Les styles sont définis dans `ui/theme/Theme.kt`. Modifiez les schémas de couleurs pour personnaliser l'apparence.
