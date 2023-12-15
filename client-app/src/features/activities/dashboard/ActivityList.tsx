import ActivityListItem from "./ActivityListItem";
import { Header } from "semantic-ui-react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../app/stores/store";
import { Fragment } from "react";

export default observer(function ActivityList() {
    const {activityStore} = useStore();
    const { groupedActivities } = activityStore;

    return (
        <>
            {groupedActivities.map(([groupName, activities]) => (
                <Fragment key={groupName}>
                    <Header sub color='teal'>
                        {groupName}
                    </Header>
                    
                    {activities.map(activity => (
                        <ActivityListItem key={activity.id} activity={activity} />
                    ))}
                </Fragment>
            ))}
        </>        
    )
})