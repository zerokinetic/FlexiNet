//
//  UserSubscribeView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//


import SwiftUI

struct UserSubscribeView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var userVM: UserViewModel
    let plan: Plan
    
    @State private var isProcessing: Bool = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text(userVM.userSubscriptions.contains(where: { $0.productId == plan.productId }) ? "Change to \(plan.name)" : "Subscribe to \(plan.name)")
                    .font(.title2)
                    .bold()
                
                Text("Price: $\(plan.price, specifier: "%.2f")")
                
                Toggle("Auto-Renewal", isOn: .constant(plan.autoRenewalAllowed))
                    .disabled(true)
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                }
                
                if let successMessage = successMessage {
                    Text(successMessage)
                        .foregroundColor(.green)
                }
                
                Button(isProcessing ? "Processing..." : "Confirm") {
                    Task {
                        await handleSubscription()
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(isProcessing)
                
                Spacer()
            }
            .padding()
        }
    }
    
    @MainActor
    private func handleSubscription() async {
        isProcessing = true
        defer { isProcessing = false }
        
        do {
            // Check if user already has a subscription
            if let existingSub = userVM.userSubscriptions.first(where: { $0.productId == plan.productId }) {
                // Already subscribed, maybe show a message
                successMessage = "You are already subscribed to \(plan.name)."
            } else if let currentSub = userVM.userSubscriptions.first {
                // Upgrade/Downgrade
                try await userVM.changeSubscription(fromPlanId: currentSub.productId, toPlan: plan)
                successMessage = "Subscription updated to \(plan.name) successfully!"
            } else {
                // New subscription
                try await userVM.subscribe(toPlan: plan)
                successMessage = "Subscribed to \(plan.name) successfully!"
            }
            
            await userVM.fetchUserSubscriptions() // Refresh subscriptions
            
        } catch {
            errorMessage = "Failed: \(error.localizedDescription)"
        }
    }
}
