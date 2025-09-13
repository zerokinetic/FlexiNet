//
//  AdminPlanListView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//

import SwiftUI

struct AdminPlanListView: View {
    @StateObject private var planVM = PlanViewModel()
    
    @State private var showingPlanSheet: Bool = false
    @State private var selectedPlan: Plan? = nil
    @State private var showingDeleteAlert: Bool = false
    
    var body: some View {
        NavigationStack {
            VStack {
                if planVM.isLoading {
                    ProgressView("Loading plans...")
                        .padding()
                } else if let error = planVM.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                } else {
                    List {
                        ForEach(planVM.plans) { plan in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(plan.name)
                                    .font(.headline)
                                Text("Price: $\(plan.price, specifier: "%.2f")")
                                    .font(.subheadline)
                                Text("Auto-Renewal: \(plan.autoRenewalAllowed ? "Yes" : "No")")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Text("Status: \(plan.status)")
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                                
                                HStack {
                                    Button("Edit") {
                                        selectedPlan = plan
                                        showingPlanSheet = true
                                    }
                                    .buttonStyle(.borderedProminent)
                                    
                                    Button("Delete") {
                                        selectedPlan = plan
                                        showingDeleteAlert = true
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(.red)
                                }
                            }
                            .padding()
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Manage Plans")
            .toolbar {
                Button("Add Plan") {
                    selectedPlan = nil
                    showingPlanSheet = true
                }
            }
            .sheet(isPresented: $showingPlanSheet) {
                AdminPlanEditView(planVM: planVM, plan: selectedPlan, isEditing: selectedPlan != nil)
            }
            .alert("Delete Plan?", isPresented: $showingDeleteAlert, actions: {
                Button("Delete", role: .destructive) {
                    Task {
                        if let plan = selectedPlan {
                            await planVM.deletePlan(planId: plan.productId)
                        }
                    }
                }
                Button("Cancel", role: .cancel) { }
            }, message: {
                Text("This action cannot be undone.")
            })
            .task {
                await planVM.fetchPlans()
            }
        }
    }
}

// MARK: - Plan Create/Edit Sheet
struct AdminPlanEditView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var planVM: PlanViewModel
    
    var plan: Plan?               // Optional Plan
    var isEditing: Bool
    
    @State private var name: String = ""
    @State private var price: Double = 0.0
    @State private var autoRenewalAllowed: Bool = false
    @State private var status: String = "Active"
    
    @State private var errorMessage: String?
    @State private var isProcessing: Bool = false
    
    init(planVM: PlanViewModel, plan: Plan?, isEditing: Bool) {
        self.planVM = planVM
        self.plan = plan
        self.isEditing = isEditing
        _name = State(initialValue: plan?.name ?? "")
        _price = State(initialValue: plan?.price ?? 0.0)
        _autoRenewalAllowed = State(initialValue: plan?.autoRenewalAllowed ?? false)
        _status = State(initialValue: plan?.status ?? "Active")
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Plan Details") {
                    TextField("Name", text: $name)
                    TextField("Price", value: $price, format: .number)
                        .keyboardType(.decimalPad)
                    Toggle("Auto-Renewal", isOn: $autoRenewalAllowed)
                    Picker("Status", selection: $status) {
                        Text("Active").tag("Active")
                        Text("Inactive").tag("Inactive")
                    }
                    .pickerStyle(.segmented)
                }
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                }
                
                Button(isProcessing ? "Processing..." : (isEditing ? "Update Plan" : "Create Plan")) {
                    Task {
                        await handlePlanAction()
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(isProcessing)
            }
            .navigationTitle(isEditing ? "Edit Plan" : "New Plan")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    @MainActor
    private func handlePlanAction() async {
        errorMessage = nil
        isProcessing = true
        defer { isProcessing = false }
        
        let newPlan = Plan(
            productId: plan?.productId ?? 0,
            name: name,
            price: price,
            autoRenewalAllowed: autoRenewalAllowed,
            status: status
        )
        
        do {
            if isEditing {
                try await planVM.updatePlan(plan: newPlan)
            } else {
                try await planVM.createPlan(plan: newPlan)
            }
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
