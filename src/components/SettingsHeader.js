import Header from './Header';
import { YELLOW } from '../settings/colors';

const SettingsHeader = props => {
    return (
        <Header
            primaryColor={ YELLOW }
            secondaryColor={ 'black' }
            backButtonEnabled={ true }
            navigation={ props.navigation }
            title={ 'Settings' } />
    );
};

export default SettingsHeader;