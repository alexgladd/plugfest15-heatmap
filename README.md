# WEST 2015 PlugFest: Heatmap Data Fusion

This project was built in two days at the PlugFest competition at WEST 2015.
The goal was to quickly design and develop and application that would solve
a problem in a fictional military scenario.

A live version of this app can be found [HERE](http://plugfest15-heat.herokuapp.com/).

## Problem Statement

Our given scenario has multiple, disparate sources of intelligence information
regarding RED FORCE positions and movements. How do we combine these sources of
intelligence (at varying levels of trust) to produce a visualization that will
allow decision-makers to effectively deploy the BLUE FORCE.

## Solution

We decided to use a visualization technique called heatmapping that renders
concentrations of geospatial data as "hot spots" on the map. This technique
allows us to combine disparate data sources to generate a map of confidence
"hot spots" show RED FORCE positions and movements.

We combined several open-source and COTS technologies to develop our
application:
* [Ruby on Rails](http://rubyonrails.org/)
* [Heatmap.js](http://www.patrick-wied.at/static/heatmapjs/)
* [ESRI ArcGIS JavaScript API](https://developers.arcgis.com/javascript/)
* [ESRI HeatmapLayer](https://github.com/Esri/heatmap-layer-js)
* [Simtable](http://www.simtable.com/) (used for presentation)

## Team

* Alex Gladd (Lookout)
* Aung A. Myat (MCTSSA)

## Notes

* The ArcGIS datasources (feature servers) may not be live by the time you're
reading this. You should be able to use any REST-based ArcGIS feature server as
your underlying datasource.

## License

Copyright 2015 Alex Gladd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
