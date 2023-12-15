import agent from '../api/agent';
import { makeAutoObservable, runInAction } from "mobx";
import { Activity } from "../models/activity";
import { v4 as uuid } from 'uuid';

export default class ActivityStore {
    // activities: Activity[] = []; -> array implementation
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this);
    }

    //sort activities by date
    get activitiesByDate() {
        return Array.from(this.activityRegistry.values())
                                               .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    //group activities by date
    get groupedActivities() {
        //we'll have an array of object and each object has a key will is the activity date
        //and for each date, we will have an array of activities inside
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = activity.date;
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];

                return activities
            }, {} as {[key: string]: Activity[]}) 
        )
    }

    loadActivities = async () => {
        this.setLoadingInitial(true);

        try {
            const activities = await agent.Activities.list();

            activities.forEach(activity => {
                this.setActivity(activity);
            });

            this.setLoadingInitial(false);
        } catch(error) {
            console.log(error);

            this.setLoadingInitial(false);          
        }
    }

    loadActivity = async (id: string) => {
        //check if activity is in the registry, else get from API
        let activity = this.getActivity(id); //variable is declared as 'let': so we can modify the value later

        if(activity) {
            this.selectedActivity = activity;
            return activity;
        } else {
            this.setLoadingInitial(true);

            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                runInAction(() => this.selectedActivity = activity);                
                this.setLoadingInitial(false);
                return activity;
            } catch(error) {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    //declared as private since this will only be used here
    //this will save an activity into the registry
    private setActivity = (activity: Activity) => {
        activity.date = activity.date.split('T')[0];
        // this.activities.push(activity); -> array implementation
        this.activityRegistry.set(activity.id, activity);
    }

    //declared as private since this will only be used here
    //this gets an activity from the registry
    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }    

    createActivity = async (activity: Activity) => {
        this.loading = true;
        activity.id = uuid();

        try {
            await agent.Activities.create(activity);
            
            runInAction(() => {
                // this.activities.push(activity); -> array implementation
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            });
        } catch(error) {
            console.log(error);
            
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    updateActivity = async (activity: Activity) => {
        this.loading = true;
        
        try {
            await agent.Activities.update(activity);

            runInAction(() => {
                /*
                    with the spread operator: this will create a new array:
                    1. this.activities.filter(x => x.id !== activity.id) -> without the activity being edited
                    2. activity -> plus the activity being edited

                    can also be written as: 
                    this.activities.filter(a => a.id !== activity.id);
                    this.activities.push(activity);
                */
                // this.activities = [...this.activities.filter(x => x.id !== activity.id), activity]; -> array implementation
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            });
        } catch(error) {
            console.log(error)

            runInAction(() => {
                this.loading = false;
            });
        }
    }

    deleteActivity = async (id: string) => {
        this.loading = true;

        try {
            await agent.Activities.delete(id);

            runInAction(() => {
                // this.activities = [...this.activities.filter(x => x.id !== id)]; -> array implementation
                this.activityRegistry.delete(id);
                this.loading = false;
            });
        } catch(error) {
            console.log(error);

            runInAction(() => {
                this.loading = false;
            });
        }
    }
}
