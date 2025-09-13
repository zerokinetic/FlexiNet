//
//  AdminAnalyticsView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//


import SwiftUI
import Charts

struct AdminAnalyticsView: View {
    @StateObject private var planVM = PlanViewModel()
    @StateObject private var userVM = UserViewModel()
    
    @State private var selectedTimeFrame: TimeFrame = .month
    
    enum TimeFrame: String, CaseIterable, Identifiable {
        case recent = "Recent"
        case month = "This Month"
        case year = "This Year"
        
        var id: String { rawValue }
    }
    
    var filteredSubscriptions: [Subscription] {
        let calendar = Calendar.current
        let now = Date()
        
        return userVM.userSubscriptions.filter { sub in
            guard let dateStr = sub.lastRenewedDate else{return false}
                  let date = dateStr //ISO8601DateFormatter().date(from: dateStr) else { return false }
            
            switch selectedTimeFrame {
            case .recent:
                return calendar.isDate(date, inSameDayAs: now) || date > now.addingTimeInterval(-7*24*3600)
            case .month:
                return calendar.isDate(date, equalTo: now, toGranularity: .month)
            case .year:
                return calendar.isDate(date, equalTo: now, toGranularity: .year)
            }
        }
    }
    
    var topPlans: [PlanStats] {
        let planCounts = Dictionary(grouping: filteredSubscriptions, by: { $0.plan?.name })
            .mapValues { $0.count }
        
        return planCounts.map { PlanStats(name: $0.key ?? "No name", subscriptions: $0.value) }
            .sorted { $0.subscriptions > $1.subscriptions }
    }
    
    struct PlanStats: Identifiable {
        let id = UUID()
        let name: String
        let subscriptions: Int
    }
    
    var body: some View {
        NavigationStack {
            VStack {
                Picker("Time Frame", selection: $selectedTimeFrame) {
                    ForEach(TimeFrame.allCases) { frame in
                        Text(frame.rawValue).tag(frame)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
                
                if userVM.isLoading || planVM.isLoading {
                    ProgressView("Loading analytics...")
                        .padding()
                } else if let error = userVM.errorMessage ?? planVM.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                } else {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            Text("Top Plans (\(selectedTimeFrame.rawValue))")
                                .font(.headline)
                                .padding(.horizontal)
                            
                            Chart(topPlans) { plan in
                                BarMark(
                                    x: .value("Subscriptions", plan.subscriptions),
                                    y: .value("Plan", plan.name)
                                )
                                .foregroundStyle(.blue)
                            }
                            .frame(height: CGFloat(topPlans.count * 40))
                            .padding()
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Plan Details")
                                    .font(.headline)
                                    .padding(.horizontal)
                                
                                ForEach(topPlans) { plan in
                                    HStack {
                                        Text(plan.name)
                                        Spacer()
                                        Text("\(plan.subscriptions) subscriptions")
                                    }
                                    .padding(.horizontal)
                                }
                            }
                        }
                        .padding(.bottom)
                    }
                }
            }
            .navigationTitle("Admin Analytics")
            .task {
                await planVM.fetchPlans()
                await userVM.fetchUserSubscriptions()
            }
        }
    }
}
