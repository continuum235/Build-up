import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import routes from "./routes";

import WelcomeScreen from "../screens/WelcomeScreen";
import LanguageSelectionScreen from "../screens/LanguageSelectionScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import RoleTypeScreen from "../screens/RoleTypeScreen";
import UploadScreen from "../screens/UploadScreen";
import RoleTitleScreen from "../screens/RoleTitleScreen";
import EmployerRoleTitleScreen from "../screens/EmployerRoleTitleScreen";
import LanguageScreen from "../screens/LanguageScreen";
import SkillsScreen from "../screens/SkillsScreen";
import BioScreen from "../screens/BioScreen";
import HourlyRateScreen from "../screens/HourlyRateScreen";
import EnterDetailsScreen from "../screens/EnterDetailsScreen";
import FindJobsScreen from "../screens/FindJobsScreen";
import YourJobsScreen from "../screens/YourJobsScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MessageScreen from "../screens/messageScreen";

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={routes.welcome}>
        <Stack.Screen name={routes.welcome} component={WelcomeScreen} />
        <Stack.Screen name={routes.languageSelection} component={LanguageSelectionScreen} />
        <Stack.Screen name={routes.login} component={LoginScreen} />
        <Stack.Screen name={routes.signup} component={SignupScreen} />
        <Stack.Screen name={routes.roleType} component={RoleTypeScreen} />
        <Stack.Screen name={routes.upload} component={UploadScreen} />
        <Stack.Screen name={routes.roleTitle} component={RoleTitleScreen} />
        <Stack.Screen name={routes.employerRoleTitle} component={EmployerRoleTitleScreen} />
        <Stack.Screen name={routes.languages} component={LanguageScreen} />
        <Stack.Screen name={routes.skills} component={SkillsScreen} />
        <Stack.Screen name={routes.bio} component={BioScreen} />
        <Stack.Screen name={routes.hourlyRate} component={HourlyRateScreen} />
        <Stack.Screen name={routes.enterDetails} component={EnterDetailsScreen} />
        <Stack.Screen name={routes.findJobs} component={FindJobsScreen} />
        <Stack.Screen name={routes.yourJobs} component={YourJobsScreen} />
        <Stack.Screen name={routes.profile} component={ProfileScreen} />
        <Stack.Screen name={routes.messages} component={MessageScreen} />
        <Stack.Screen name={routes.jobDetails} component={JobDetailsScreen} />
    </Stack.Navigator>
);

export default AppNavigator;
