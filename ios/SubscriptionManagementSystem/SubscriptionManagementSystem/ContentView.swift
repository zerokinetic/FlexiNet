//
//  ContentView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//

import SwiftUI
import SwiftUI

struct ContentView: View {
    @StateObject private var authVM = AuthViewModel()
    
    var body: some View {
        Group {
            if authVM.isAuthenticated {
                DashboardView(authVM: authVM)
            } else {
                LoginView()
                    .environmentObject(authVM)
            }
        }
        .onAppear {
            // ✅ Optional: check if user session is saved locally (auto-login)
            // Example: if you have stored a token or user in UserDefaults
            if let savedUserData = UserDefaults.standard.data(forKey: "currentUser"),
               let decodedUser = try? JSONDecoder().decode(User.self, from: savedUserData) {
                authVM.currentUser = decodedUser
                authVM.isAuthenticated = true
            }
        }
    }
}


#Preview {
    ContentView()
}
