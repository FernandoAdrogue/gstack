# Test App Prompt: "FitTrack" — Workout Tracker with 4 Bugs

Create a SwiftUI iOS 17+ app called **FitTrack** — a simple workout tracker.
It has 3 tabs: Workouts, Stats, Profile. Each tab has intentional bugs that
/ios-qa can find and /ios-fix can repair.

## App Structure

### Models

```swift
// Workout.swift
import Foundation

struct Workout: Identifiable, Codable {
    let id: UUID
    var name: String
    var sets: Int
    var reps: Int
    var weight: Double // in lbs
    var date: Date
    
    var totalVolume: Double {
        Double(sets * reps) * weight
    }
}
```

### ViewModels

```swift
// WorkoutViewModel.swift
import SwiftUI

@Observable
class WorkoutViewModel {
    var workouts: [Workout] = []
    var weeklyVolume: Double = 0
    var personalBest: Double = 0
    
    func addWorkout(_ workout: Workout) {
        workouts.append(workout)
        recalculateStats()
    }
    
    func removeWorkout(at index: Int) {
        workouts.remove(at: index)
        recalculateStats()
    }
    
    // BUG 1: weeklyVolume calculation is wrong
    // It should sum totalVolume for workouts in the last 7 days
    // Instead it only counts workouts from TODAY (not the full week)
    private func recalculateStats() {
        let start = Calendar.current.startOfDay(for: Date()) // BUG: should be 7 days ago
        let thisWeek = workouts.filter { $0.date >= start }
        weeklyVolume = thisWeek.reduce(0) { $0 + $1.totalVolume }
        personalBest = workouts.map(\.totalVolume).max() ?? 0
    }
}
```

```swift
// StatsViewModel.swift
import SwiftUI

@Observable
class StatsViewModel {
    var streakDays: Int = 0
    var totalWorkouts: Int = 0
    var averageVolume: Double = 0
    
    // BUG 2: streak calculation counts future dates
    // Should only count consecutive days UP TO today, going backwards
    func calculateStreak(from workouts: [Workout]) {
        totalWorkouts = workouts.count
        averageVolume = workouts.isEmpty ? 0 : workouts.reduce(0) { $0 + $1.totalVolume } / Double(workouts.count)
        
        // Bug: doesn't check that dates are <= today, and counts
        // non-consecutive days. Should walk backwards from today.
        let uniqueDays = Set(workouts.map { Calendar.current.startOfDay(for: $0.date) })
        streakDays = uniqueDays.count  // BUG: should be consecutive days ending today
    }
}
```

```swift
// ProfileViewModel.swift
import SwiftUI

@Observable
class ProfileViewModel {
    var name: String = "Athlete"
    var goalVolume: Double = 10000 // weekly goal in lbs
    var unit: String = "lbs"
    
    // BUG 3: unit conversion is backwards
    // When switching to kg, it should DIVIDE by 2.205
    // Instead it MULTIPLIES (making the number bigger, not smaller)
    func toggleUnit() {
        if unit == "lbs" {
            unit = "kg"
            goalVolume = goalVolume * 2.205  // BUG: should divide
        } else {
            unit = "lbs"
            goalVolume = goalVolume / 2.205  // BUG: should multiply
        }
    }
}
```

### Views

```swift
// WorkoutTab.swift
import SwiftUI

struct WorkoutTab: View {
    @State var viewModel: WorkoutViewModel
    @State private var showingAddSheet = false
    
    var body: some View {
        NavigationStack {
            List {
                Section("This Week") {
                    HStack {
                        Text("Volume")
                        Spacer()
                        Text("\(Int(viewModel.weeklyVolume)) lbs")
                            .bold()
                    }
                    HStack {
                        Text("Personal Best")
                        Spacer()
                        Text("\(Int(viewModel.personalBest)) lbs")
                            .foregroundStyle(.orange)
                    }
                }
                
                Section("Recent Workouts") {
                    ForEach(viewModel.workouts.sorted(by: { $0.date > $1.date })) { workout in
                        WorkoutRow(workout: workout)
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            viewModel.removeWorkout(at: index)
                        }
                    }
                }
            }
            .navigationTitle("FitTrack")
            .toolbar {
                Button("Add", systemImage: "plus") {
                    showingAddSheet = true
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddWorkoutSheet(viewModel: viewModel)
            }
        }
    }
}

struct WorkoutRow: View {
    let workout: Workout
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(workout.name)
                .font(.headline)
            // BUG 4: Display shows "sets x weight" but should show "sets x reps @ weight"
            Text("\(workout.sets) x \(Int(workout.weight)) lbs")  // BUG: missing reps
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}
```

```swift
// AddWorkoutSheet.swift
import SwiftUI

struct AddWorkoutSheet: View {
    @State var viewModel: WorkoutViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var sets = 3
    @State private var reps = 10
    @State private var weight = 135.0
    
    var body: some View {
        NavigationStack {
            Form {
                TextField("Exercise Name", text: $name)
                Stepper("Sets: \(sets)", value: $sets, in: 1...10)
                Stepper("Reps: \(reps)", value: $reps, in: 1...30)
                HStack {
                    Text("Weight")
                    Spacer()
                    TextField("lbs", value: $weight, format: .number)
                        .keyboardType(.decimalPad)
                        .frame(width: 80)
                        .multilineTextAlignment(.trailing)
                }
            }
            .navigationTitle("Add Workout")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let workout = Workout(
                            id: UUID(),
                            name: name,
                            sets: sets,
                            reps: reps,
                            weight: weight,
                            date: Date()
                        )
                        viewModel.addWorkout(workout)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}
```

```swift
// StatsTab.swift
import SwiftUI

struct StatsTab: View {
    @State var statsViewModel: StatsViewModel
    let workoutViewModel: WorkoutViewModel
    
    var body: some View {
        NavigationStack {
            List {
                Section("Streak") {
                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundStyle(.orange)
                        Text("\(statsViewModel.streakDays) day streak")
                            .font(.title2)
                    }
                }
                
                Section("All Time") {
                    LabeledContent("Total Workouts", value: "\(statsViewModel.totalWorkouts)")
                    LabeledContent("Avg Volume", value: "\(Int(statsViewModel.averageVolume)) lbs")
                }
            }
            .navigationTitle("Stats")
            .onAppear {
                statsViewModel.calculateStreak(from: workoutViewModel.workouts)
            }
        }
    }
}
```

```swift
// ProfileTab.swift
import SwiftUI

struct ProfileTab: View {
    @State var viewModel: ProfileViewModel
    
    var body: some View {
        NavigationStack {
            List {
                Section("Profile") {
                    LabeledContent("Name", value: viewModel.name)
                }
                
                Section("Goals") {
                    LabeledContent("Weekly Volume Goal", value: "\(Int(viewModel.goalVolume)) \(viewModel.unit)")
                    Button("Switch to \(viewModel.unit == "lbs" ? "kg" : "lbs")") {
                        viewModel.toggleUnit()
                    }
                }
                
                Section("Unit") {
                    Text("Current: \(viewModel.unit)")
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Profile")
        }
    }
}
```

```swift
// ContentView.swift
import SwiftUI

struct ContentView: View {
    @State private var workoutVM = WorkoutViewModel()
    @State private var statsVM = StatsViewModel()
    @State private var profileVM = ProfileViewModel()
    
    var body: some View {
        TabView {
            WorkoutTab(viewModel: workoutVM)
                .tabItem {
                    Label("Workouts", systemImage: "dumbbell.fill")
                }
            
            StatsTab(statsViewModel: statsVM, workoutViewModel: workoutVM)
                .tabItem {
                    Label("Stats", systemImage: "chart.bar.fill")
                }
            
            ProfileTab(viewModel: profileVM)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
    }
}
```

## The 4 Bugs (for /ios-qa to find, /ios-fix to repair)

| # | Bug | Location | Symptom | Fix |
|---|-----|----------|---------|-----|
| 1 | Weekly volume only counts today | `WorkoutViewModel.recalculateStats()` | Volume shows 0 when workouts were yesterday | Change `startOfDay(for: Date())` to `Date().addingTimeInterval(-7*24*3600)` |
| 2 | Streak counts non-consecutive days | `StatsViewModel.calculateStreak()` | Shows "5 day streak" when workouts were Mon, Wed, Fri (should be 1) | Walk backwards from today counting consecutive days |
| 3 | Unit conversion is inverted | `ProfileViewModel.toggleUnit()` | Switching to kg makes number BIGGER (22,050 kg) | Swap multiply/divide |
| 4 | Workout row missing reps | `WorkoutRow` | Shows "3 x 135 lbs" not "3 x 10 @ 135 lbs" | Add `reps` to the text |

## Important Notes

- Use iOS 17+ with @Observable (NOT ObservableObject)
- Add `UILaunchScreen` key to Info.plist (empty dict) so it uses full screen
- The DebugBridge will be generated by /ios-qa — don't include it
- Keep it simple: no persistence, no networking, just in-memory state
- Make sure the tab bar uses SF Symbols as shown above
