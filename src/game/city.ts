import type {District} from './types';

export interface CityConfiguration {
  id:string;
  name:string;
  districtLength:number;
  districts:readonly {id:District;name:string;moduleVariants:number}[];
}

/** Add cities here with matching render kits; the shipped demo selects Solara Bay. */
export const CITY:CityConfiguration={id:'solara-bay',name:'Solara Bay',districtLength:600,districts:[
  {id:'station',name:'Sunline Station',moduleVariants:3},
  {id:'mural',name:'Painted Quarter',moduleVariants:3},
  {id:'waterfront',name:'Copper Quay',moduleVariants:3},
]};
