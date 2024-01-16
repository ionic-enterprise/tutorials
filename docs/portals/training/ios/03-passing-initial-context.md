---
title: Passing authentication tokens to the Portal
sidebar_label: Initial Context
sidebar_position: 3
---

## 1. Add `toJSObject` method

Only include the relevant portions of code, the inputs and the struct, from `CredentialsManager`:

```swift CredentialsManager.swift focus=2,13:18
import Foundation
import Capacitor

struct Credentials: Decodable {
    var accessToken: String
    var refreshToken: String
    
    private enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
    }
    
    func toJSObject() -> [String: JSValue] {
        return [
            "accessToken": self.accessToken,
            "refreshToken": self.refreshToken
        ]
    }
}
```

## 2. Add initial context to `PortalView`

```swift WebAppView.swift focus=10:14
import SwiftUI
import IonicPortals

struct WebAppView: View {
    @EnvironmentObject var credentialsManager: CredentialsManager
    @Environment(\.dismiss) var dismiss
    let metadata: WebAppMetadata
    
    var body: some View {
        PortalView(portal: .init(
            name: "debug",
            startDir: "portals/debug",
            initialContext: credentialsManager.credentials!.toJSObject()
        ))
        .ignoresSafeArea()
        .navigationBarBackButtonHidden()
    }
}

#Preview {
    WebAppView(metadata: WebApps.metadata[0])
        .environmentObject(CredentialsManager.preview)
}
```