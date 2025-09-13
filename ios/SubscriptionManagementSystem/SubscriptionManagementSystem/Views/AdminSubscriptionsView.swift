
//
//  AdminSubscriptionsView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//
import SwiftUI

struct AdminSubscriptionsView: View {
    @StateObject private var userVM = UserViewModel()
    @StateObject private var planVM = PlanViewModel()
    
    @State private var selectedSubscription: Subscription?
    @State private var showingActionSheet: Bool = false
    
    var body: some View {
        NavigationStack {
            VStack {
                if userVM.isLoading || planVM.isLoading {
                    ProgressView("Loading subscriptions...")
                        .padding()
                } else if let error = userVM.errorMessage ?? planVM.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                } else {
                    List {
                        ForEach(userVM.userSubscriptions) { sub in
                            VStack(alignment: .leading, spacing: 8) {
                                // Using available properties from Subscription model
                                Text("User ID: \(sub.userId)")
                                    .font(.headline)
                                
                                Text("Product ID: \(sub.productId)")
                                    .font(.subheadline)
                                
                                if let plan = sub.plan {
                                    Text("Plan: \(plan.name)")
                                        .font(.subheadline)
                                        .foregroundColor(.blue)
                                }
                                
                                Text("Status: \(sub.status.capitalized)")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                
                                Text("Start Date: \(formattedDate(sub.startDate))")
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                                
                                if let lastBilled = sub.lastBilledDate {
                                    Text("Last Billed: \(formattedDate(lastBilled))")
                                        .font(.caption2)
                                        .foregroundColor(.gray)
                                }
                                
                                HStack {
                                    Button("Cancel") {
                                        Task {
                                            do {
                                                try await userVM.cancelSubscription(forPlanId: sub.productId)
                                                await userVM.fetchUserSubscriptions()
                                            } catch {
                                                userVM.errorMessage = "Failed to cancel subscription: \(error.localizedDescription)"
                                            }
                                        }
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(.red)
                                    
                                    Button("Change Plan") {
                                        selectedSubscription = sub
                                        showingActionSheet = true
                                    }
                                    .buttonStyle(.borderedProminent)
                                }
                            }
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("User Subscriptions")
            .task {
                await planVM.fetchPlans()
                await userVM.fetchUserSubscriptions()
            }
            .actionSheet(isPresented: $showingActionSheet) {
                var buttons: [ActionSheet.Button] = planVM.plans.map { plan in
                    .default(Text("\(plan.name) - $\(plan.price, specifier: "%.2f")")) {
                        Task {
                            guard let currentSub = selectedSubscription else { return }
                            do {
                                try await userVM.changeSubscription(fromPlanId: currentSub.productId, toPlan: plan)
                                await userVM.fetchUserSubscriptions()
                            } catch {
                                userVM.errorMessage = "Failed to change subscription: \(error.localizedDescription)"
                            }
                        }
                    }
                }
                buttons.append(.cancel())
                
                return ActionSheet(
                    title: Text("Select New Plan"),
                    message: Text("Choose a new plan for this subscription"),
                    buttons: buttons
                )
            }
        }
    }
    
    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}
