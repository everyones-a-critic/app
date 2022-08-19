import { render, screen } from '@testing-library/react-native';

import InputSet from "./inputSet";
import {selectInput} from "../actions";

test('test mock', () => {
   jest.mock('../actions');
   selectInput().mockResolvedValue({})
});