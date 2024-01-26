---
title: Dynamic Portal View
sidebar_label: Plugging in Portals
---

## Update `.portals.yaml`

```yaml
sync:
  - file-path: ../web/apps/expenses/dist
    directory-name: portals/expenses
  - file-path: ../web/apps/tasks/dist
    directory-name: portals/tasks
  - file-path: ../web/apps/time-tracking/dist
    directory-name: portals/time-tracking
```

## Update `WebAppView.swift`

```swift
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(
            name: metadata.name,
            startDir: "portals/\(metadata.name)",
            initialContext: credentialsManager.credentials!.toJSObject()
        ).adding(AnalyticsPlugin()))
        .ignoresSafeArea()
        .navigationBarBackButtonHidden()
        .task {
            let stream = PortalsPubSub.subscribe(to: "navigate:back")
            for await _ in stream {
                self.dismiss()
            }
        }
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```

## FINAL STEPS

1. Delete debug folder.
2. Set `devModeEnabled` to `true` on the Portal

```swift
PortalView(portal: .init(
            name: metadata.name,
            startDir: "portals/\(metadata.name)",
            devModeEnabled: true,
            initialContext: credentialsManager.credentials!.toJSObject()
        )
        .adding(AnalyticsPlugin()))
```

MUST BE BEFORE INITIAL CONTEXT