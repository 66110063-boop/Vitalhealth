import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const todayStr = () => new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

export const useHealthStore = create(
  persist(
    (set, get) => ({
      steps: 0,
      caloriesBurned: 0,
      caloriesIntake: 0,
      sleepHours: 0,
      logs: [], // { id, type, value, label, date }
      lastResetDate: todayStr(),
      isDarkMode: false,
      themeColor: '#16a97a',
      physicalProfile: {
        age: 28,
        weight: 65,
        height: 170,
        gender: 'ชาย',
        activityLevel: '1.2'
      },
      notificationSettings: {
        exercise: { active: false, time: '06:00' },
        food: { active: false, time: '12:00' },
        sleep: { active: false, time: '22:00' },
        water: { active: false, interval: '2' },
        emailAlert: { active: false },
        emailAddress: ''
      },
      goals: {
        steps: 10000,
        calories: 2000,
        sleep: 8,
        targetWeight: 60
      },

      // Check and auto-reset daily stats if it's a new day
      checkDailyReset: () => {
        const today = todayStr()
        if (get().lastResetDate !== today) {
          set({ steps: 0, caloriesBurned: 0, caloriesIntake: 0, sleepHours: 0, lastResetDate: today })
        }
      },

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setThemeColor: (themeColor, email) => {
        set({ themeColor });
        if (email) get().saveUserToCloud(email);
      },
      
      updateNotificationSettings: (key, updates, email) => set((state) => {
        const currentSetting = state.notificationSettings[key];
        const newSetting = typeof currentSetting === 'object' && currentSetting !== null
          ? { ...currentSetting, ...updates }
          : updates;
        const nextState = {
          notificationSettings: {
            ...state.notificationSettings,
            [key]: newSetting
          }
        };
        setTimeout(() => {
          if (email) get().saveUserToCloud(email);
        }, 0);
        return nextState;
      }),

      updatePhysicalProfile: (updates, email) => set((state) => {
        const nextState = {
          physicalProfile: {
            ...state.physicalProfile,
            ...updates
          }
        };
        setTimeout(() => {
          if (email) get().saveUserToCloud(email);
        }, 0);
        return nextState;
      }),

      updateGoals: (updates, email) => set((state) => {
        const nextState = {
          goals: {
            ...state.goals,
            ...updates
          }
        };
        setTimeout(() => {
          if (email) get().saveUserToCloud(email);
        }, 0);
        return nextState;
      }),

      saveUserToCloud: async (email) => {
        if (!email || !email.includes('@')) return;
        const state = get();
        try {
          await fetch('/api/user-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              profile: {
                age: state.physicalProfile.age,
                weight: state.physicalProfile.weight,
                height: state.physicalProfile.height,
                gender: state.physicalProfile.gender,
                activityLevel: state.physicalProfile.activityLevel
              },
              settings: {
                themeColor: state.themeColor,
                goals: state.goals,
                notificationSettings: state.notificationSettings
              }
            })
          });
        } catch (error) {
          console.error('Failed to save user to cloud:', error);
        }
      },

      saveDailyLogToCloud: async (email) => {
        if (!email || !email.includes('@')) return;
        const state = get();
        try {
          await fetch('/api/logs-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              steps: state.steps,
              caloriesBurned: state.caloriesBurned,
              caloriesIntake: state.caloriesIntake,
              sleepHours: state.sleepHours,
              logDate: todayStr()
            })
          });
        } catch (error) {
          console.error('Failed to save daily logs to cloud:', error);
        }
      },

      syncWithCloud: async (email) => {
        if (!email || !email.includes('@')) return;
        try {
          // 1. Fetch profile & settings
          const userRes = await fetch(`/api/user-sync?email=${encodeURIComponent(email)}`);
          if (userRes.ok) {
            const data = await userRes.json();
            const updates = {};
            
            if (data.profile) {
              updates.physicalProfile = {
                age: data.profile.age,
                weight: Number(data.profile.weight),
                height: Number(data.profile.height),
                gender: data.profile.gender,
                activityLevel: data.profile.activity_level
              };
            }
            if (data.settings) {
              if (data.settings.theme_color) updates.themeColor = data.settings.theme_color;
              
              if (data.settings.goals) {
                updates.goals = typeof data.settings.goals === 'string' 
                  ? JSON.parse(data.settings.goals) 
                  : data.settings.goals;
              }
              if (data.settings.notification_settings) {
                updates.notificationSettings = typeof data.settings.notification_settings === 'string'
                  ? JSON.parse(data.settings.notification_settings)
                  : data.settings.notification_settings;
              }
            }

            // 2. Fetch daily logs and map steps, calories, sleep for today
            const logsRes = await fetch(`/api/logs-sync?email=${encodeURIComponent(email)}`);
            if (logsRes.ok) {
              const logsData = await logsRes.json();
              const today = todayStr();
              const todayLog = logsData.find(l => l.logDate === today);
              if (todayLog) {
                updates.steps = todayLog.steps || 0;
                updates.caloriesBurned = todayLog.caloriesBurned || 0;
                updates.caloriesIntake = todayLog.caloriesIntake || 0;
                updates.sleepHours = Number(todayLog.sleepHours) || 0;
              }
            }

            set(updates);
          }
        } catch (error) {
          console.error('Failed to sync with cloud:', error);
        }
      },

      syncGoogleFitSteps: async (accessToken, email, simulate = false) => {
        if (simulate) {
          // Generate a realistic, healthy number of steps
          const randomSteps = Math.floor(Math.random() * (9500 - 6500 + 1)) + 6500;
          set({ steps: randomSteps });
          if (email) {
            setTimeout(() => {
              get().saveDailyLogToCloud(email);
            }, 0);
          }
          return randomSteps;
        }

        try {
          const startTimeMillis = new Date();
          startTimeMillis.setHours(0, 0, 0, 0);
          const endTimeMillis = new Date();

          const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              aggregateBy: [{
                dataTypeName: 'com.google.step_count.delta',
                dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
              }],
              bucketByTime: { durationMillis: 86400000 },
              startTimeMillis: startTimeMillis.getTime(),
              endTimeMillis: endTimeMillis.getTime()
            })
          });

          if (response.ok) {
            const data = await response.json();
            const buckets = data.bucket || [];
            let totalSteps = 0;
            
            buckets.forEach(bucket => {
              const dataset = bucket.dataset || [];
              dataset.forEach(ds => {
                const points = ds.point || [];
                points.forEach(point => {
                  const values = point.value || [];
                  values.forEach(val => {
                    if (val.intVal) {
                      totalSteps += val.intVal;
                    }
                  });
                });
              });
            });

            set({ steps: totalSteps });
            if (email) {
              setTimeout(() => {
                get().saveDailyLogToCloud(email);
              }, 0);
            }
            return totalSteps;
          } else {
            console.error('Failed to sync Google Fit steps');
            return null;
          }
        } catch (error) {
          console.error('Error syncing Google Fit steps:', error);
          return null;
        }
      },

      addLog: (entry, email) => set((state) => {
        const today = todayStr()
        // Auto-reset if new day
        const isNewDay = state.lastResetDate !== today
        const resetStats = isNewDay ? { steps: 0, caloriesBurned: 0, caloriesIntake: 0, sleepHours: 0, lastResetDate: today } : {}

        const newEntry = {
          ...entry,
          id: Date.now(),
          date: new Date().toISOString()
        }
        
        const updatedLogs = [newEntry, ...state.logs]
        let updates = { ...resetStats, logs: updatedLogs }
        
        if (entry.type === 'exercise') {
          updates.caloriesBurned = (isNewDay ? 0 : state.caloriesBurned) + entry.value
        } else if (entry.type === 'food') {
          updates.caloriesIntake = (isNewDay ? 0 : state.caloriesIntake) + entry.value
        } else if (entry.type === 'sleep') {
          updates.sleepHours = entry.value // Latest sleep entry for the day
        } else if (entry.type === 'steps') {
          updates.steps = (isNewDay ? 0 : state.steps) + entry.value
        }

        setTimeout(() => {
          if (email) get().saveDailyLogToCloud(email);
        }, 0);

        return updates
      }),

      resetData: (email) => {
        set({
          steps: 0,
          caloriesBurned: 0,
          caloriesIntake: 0,
          sleepHours: 0,
          logs: [],
          lastResetDate: todayStr()
        });
        if (email) {
          fetch(`/api/logs-sync?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
            .catch(err => console.error('Failed to clear logs on server:', err));
          get().saveUserToCloud(email);
        }
      }
    }),
    {
      name: 'vitalhealth_storage',
    }
  )
)
