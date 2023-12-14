import agent from '../api/agent';
import { makeAutoObservable, runInAction } from "mobx";
import { Activity } from "../models/activity";
import {v4 as uuid} from 'uuid';

export default class ActivityStore {
    // activities: Activity[] = []; -> array implementation
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = true;

    constructor() {
        makeAutoObservable(this);
    }

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values())
                                               .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    loadActivities = async () => {
        try {
            const activities = await agent.Activities.list();

            activities.forEach(activity => {
                activity.date = activity.date.split('T')[0];
                // this.activities.push(activity); -> array implementation
                this.activityRegistry.set(activity.id, activity);
            });

            this.setLoadingInitial(false);
        } catch(error) {
            console.log(error);

            this.setLoadingInitial(false);          
        }
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    selectActivity = (id: string) => {
        // this.selectedActivity = this.activities.find(a => a.id === id); -> array implementation
        this.selectedActivity = this.activityRegistry.get(id);
    }

    cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    openForm = (id?: string) => {
        id ? this.selectActivity(id) : this.cancelSelectedActivity();

        this.editMode = true;
    }

    closeForm = () => {
        this.editMode = false;
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
                if (this.selectedActivity?.id === id) this.cancelSelectedActivity();
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
