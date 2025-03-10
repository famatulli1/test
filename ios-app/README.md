# Dictaphone iOS App

Application de dictaphone native iOS développée avec SwiftUI et intégrant la transcription audio via l'API Whisper d'OpenAI.

## Fonctionnalités

- 🎙️ Enregistrement audio avec visualisation de la forme d'onde en temps réel
- 🔄 Transcription automatique via Whisper API
- 🎨 Interface SwiftUI moderne avec support du mode sombre
- 📱 Design adaptatif iPhone & iPad
- 🔒 Gestion sécurisée de la clé API

## Prérequis

- Xcode 15.0 ou supérieur
- iOS 15.0 ou supérieur
- Une clé API OpenAI valide
- Un compte développeur Apple (pour le déploiement sur appareil)

## Installation

1. Clonez le dépôt
2. Ouvrez `Dictaphone.xcodeproj` dans Xcode
3. Sélectionnez votre équipe de développement dans les paramètres du projet
4. Compilez et exécutez l'application

## Configuration

Lors du premier lancement, l'application vous demandera votre clé API OpenAI. Vous pouvez la modifier ultérieurement dans les paramètres de l'application.

## Architecture

L'application utilise une architecture MVVM moderne avec SwiftUI :

```
Dictaphone/
├── App/
│   └── DictaphoneApp.swift       # Point d'entrée
├── Models/
│   └── AudioRecord.swift         # Modèles de données
├── Core/
│   ├── Audio/                    # Gestion audio
│   └── Network/                  # API Whisper
├── UI/
│   ├── Screens/                  # Écrans principaux
│   ├── Components/               # Composants réutilisables
│   └── Styling/                  # Thème et styles
└── Utilities/                    # Utilitaires
```

## Technologies Utilisées

- **SwiftUI** pour l'interface utilisateur
- **AVFoundation** pour l'enregistrement audio
- **Combine** pour la programmation réactive
- **URLSession** pour les appels réseau
- **Core Graphics** pour le rendu de la forme d'onde

## Permissions Requises

- Microphone : Pour l'enregistrement audio
- Internet : Pour la transcription via Whisper API

## Développement

### Ajouter un nouvel écran

1. Créez un nouveau fichier dans `UI/Screens`
2. Utilisez le template SwiftUI View
3. Implémentez la navigation dans `ContentView`

### Modifier le thème

Le thème est défini dans `UI/Styling/Theme.swift`. Vous pouvez ajuster les couleurs et styles ici.

### Gestion de l'état

L'état global est géré via `AppState`. Les états locaux sont gérés par les ViewModels respectifs.

## Dépannage

### Problèmes courants

1. **Erreur de microphone**
   - Vérifiez les permissions dans Info.plist
   - Assurez-vous que l'autorisation est accordée dans les paramètres

2. **Erreur de transcription**
   - Vérifiez la validité de la clé API
   - Vérifiez la connexion internet

## Tests

Exécutez les tests unitaires via Xcode :
```bash
CMD + U
```

## Distribution

1. Configurez les certificats de distribution
2. Incrémentez le numéro de version
3. Archivez et soumettez via Xcode
