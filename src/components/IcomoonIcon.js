import Icomoon from "react-native-icomoon"
import type { IconMoonProps } from 'react-native-icomoon'
import json from '../selection.json'


const Icon = ({ name, ...restProps }) => {
    return <Icomoon iconSet={json} name={name} {...restProps} />
};

export default Icon;