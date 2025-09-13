//
//  AdminPlanFormView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//


import SwiftUI

struct AdminPlanFormView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var planVM: PlanViewModel
    
    @State var name: String = ""
    @State var price: String = ""
    @State var autoRenewalAllowed: Bool = true
    @State var status: String = "Active"
    
    var planToEdit: Plan? = nil
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Plan Details") {
                    TextField("Name", text: $name)
                    TextField("Price", text: $price)
                        .keyboardType(.decimalPad)
                    
                    Toggle("Auto-Renewal Allowed", isOn: $autoRenewalAllowed)
                    
                    Picker("Status", selection: $status) {
                        Text("Active").tag("Active")
                        Text("Inactive").tag("Inactive")
                    }
                    .pickerStyle(.segmented)
                }
                
                Button(planToEdit == nil ? "Add Plan" : "Update Plan") {
                    Task {
                        await savePlan()
                    }
                }
                .buttonStyle(.borderedProminent)
            }
            .navigationTitle(planToEdit == nil ? "Add Plan" : "Edit Plan")
            .onAppear {
                if let plan = planToEdit {
                    name = plan.name
                    price = String(plan.price)
                    autoRenewalAllowed = plan.autoRenewalAllowed
                    status = plan.status
                }
            }
        }
    }
    
    @MainActor
    private func savePlan() async {
        guard let planPrice = Double(price) else { return }
        
        let plan = Plan(
            productId: planToEdit?.productId ?? Int(Date().timeIntervalSince1970),
            name: name,
            price: planPrice,
            autoRenewalAllowed: autoRenewalAllowed,
            status: status
        )
        
        if planToEdit == nil {
            await planVM.createPlan(plan: plan)
        } else {
            await planVM.updatePlan(plan: plan)
        }
        
        dismiss()
    }
}
