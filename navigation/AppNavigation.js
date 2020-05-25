import { createStackNavigator } from 'react-navigation-stack'
import Home from '../screens/Home';
import Editor from '../screens/Editor';

const AppNavigation = createStackNavigator(
    {
        Home: { screen: Home },
        Editor: { screen: Editor }
    },
    {
        initialRouteName: 'Home',
        headerMode: "none"
    }
)

export default AppNavigation