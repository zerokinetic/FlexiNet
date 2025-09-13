//
//  DashboardView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//

import SwiftUI

struct DashboardView: View {
    @ObservedObject var authVM: AuthViewModel
    
    var body: some View {
        if let user = authVM.currentUser {
            if user.role == "admin" {
                AdminDashboardView(authVM: authVM)
            } else {
                UserDashboardView(authVM: authVM)
            }
        } else {
            LoginView()
        }
    }
}

struct UserDashboardView: View {
    @ObservedObject var authVM: AuthViewModel
    @StateObject private var planVM = PlanViewModel()
    @StateObject private var userVM = UserViewModel()
    
    @State private var showingSubscriptionSheet: Bool = false
    @State private var selectedPlan: Plan? = nil
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 15) {
                headerView
                contentView
            }
            .navigationTitle("User Dashboard")
            .alert("Notification", isPresented: $showingAlert) {
                Button("OK") { }
            } message: {
                Text(alertMessage)
            }
            .sheet(isPresented: $showingSubscriptionSheet) {
                subscriptionSheet
            }
            .task {
                if let token = authVM.accessToken {
                    userVM.accessToken = token
                }
                await planVM.fetchPlans()
                await userVM.fetchUserSubscriptions()
            }
        }
    }
    
    // MARK: - Header View
    private var headerView: some View {
        Text("Welcome, \(authVM.currentUser?.name ?? "User") 👋")
            .font(.title2)
            .bold()
    }
    
    // MARK: - Content View
    private var contentView: some View {
        Group {
            if planVM.isLoading || userVM.isLoading {
                loadingView
            } else if let error = planVM.errorMessage ?? userVM.errorMessage {
                errorView(error)
            } else {
                mainContentView
            }
        }
    }
    
    // MARK: - Loading View
    private var loadingView: some View {
        ProgressView("Loading data...")
            .padding()
    }
    
    // MARK: - Error View
    private func errorView(_ error: String) -> some View {
        Text(error)
            .foregroundColor(.red)
            .padding()
    }
    
    // MARK: - Main Content View
    private var mainContentView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                currentSubscriptionsSection
                availablePlansSection
            }
            .padding()
        }
    }
    
    // MARK: - Current Subscriptions Section
    @ViewBuilder
    private var currentSubscriptionsSection: some View {
        if !userVM.userSubscriptions.isEmpty {
            Text("My Subscriptions")
                .font(.headline)
            
            ForEach(userVM.userSubscriptions) { subscription in
                subscriptionCard(for: subscription)
            }
        }
    }
    
    // MARK: - Subscription Card
    private func subscriptionCard(for subscription: Subscription) -> some View {
        VStack(alignment: .leading) {
            Text(subscription.plan?.name ?? "Unknown Plan")
                .font(.subheadline)
                .bold()
            
            Text("Status: \(subscription.status.capitalized)")
                .font(.caption)
                .foregroundColor(.gray)
            
            Text("Last Renewed: \(formatDate(subscription.lastRenewedDate) ?? "N/A")")
                .font(.caption2)
                .foregroundColor(.gray)
            
            subscriptionActions(for: subscription)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
    
    // MARK: - Subscription Actions
    private func subscriptionActions(for subscription: Subscription) -> some View {
        HStack {
            Button("Cancel") {
                Task {
                    do {
                        try await userVM.cancelSubscription(forPlanId: subscription.productId)
                        alertMessage = "Subscription cancelled successfully"
                        showingAlert = true
                    } catch {
                        alertMessage = "Failed to cancel subscription: \(error.localizedDescription)"
                        showingAlert = true
                    }
                }
            }
            .buttonStyle(.bordered)
            .tint(.red)
            
            changePlanNavigationLink
        }
    }
    
    // MARK: - Change Plan Navigation Link
    private var changePlanNavigationLink: some View {
        NavigationLink("Change Plan") {
            List(planVM.plans) { plan in
                Button(plan.name) {
                    selectedPlan = plan
                    showingSubscriptionSheet = true
                }
            }
            .navigationTitle("Select Plan")
        }
        .buttonStyle(.borderedProminent)
    }
    
    // MARK: - Available Plans Section
    private var availablePlansSection: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Available Plans")
                .font(.headline)
            
            ForEach(planVM.plans) { plan in
                planCard(for: plan)
            }
        }
    }
    
    // MARK: - Plan Card
    private func planCard(for plan: Plan) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(plan.name)
                .font(.subheadline)
            
            Text("Price: $\(plan.price, specifier: "%.2f")")
                .font(.caption)
            
            Text("Auto-Renewal: \(plan.autoRenewalAllowed ? "Yes" : "No")")
                .font(.caption2)
                .foregroundColor(.gray)
            
            Button("Subscribe") {
                selectedPlan = plan
                showingSubscriptionSheet = true
            }
            .buttonStyle(.borderedProminent)
            .disabled(userVM.userSubscriptions.contains { $0.productId == plan.productId && $0.status.lowercased() == "active" })
        }
        .padding()
        .background(Color.blue.opacity(0.05))
        .cornerRadius(8)
    }
    
    // MARK: - Date Formatting Helper
    private func formatDate(_ date: Date?) -> String? {
        guard let date = date else { return nil }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    // MARK: - Subscription Sheet
    @ViewBuilder
    private var subscriptionSheet: some View {
        if let plan = selectedPlan {
            UserSubscribeView(userVM: userVM, plan: plan)
        }
    }
}

struct AdminDashboardView: View {
    @ObservedObject var authVM: AuthViewModel
    
    var body: some View {
        TabView {
            // MARK: - Plans Tab
            AdminPlanListView()
                .tabItem {
                    Label("Plans", systemImage: "doc.text")
                }
            
            // MARK: - Analytics Tab
            AdminAnalyticsView()
                .tabItem {
                    Label("Analytics", systemImage: "chart.bar")
                }
            
            // MARK: - Subscriptions Tab
            AdminSubscriptionsView()
                .tabItem {
                    Label("Subscriptions", systemImage: "list.bullet.rectangle")
                }
        }
    }
}
