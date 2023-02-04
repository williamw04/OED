/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { Button } from 'reactstrap';
import * as moment from 'moment';
import graphExport, { graphRawExport, downloadRawCSV } from '../utils/exportData';
import { ExportDataSet } from '../types/readings';
import { FormattedMessage } from 'react-intl';
import { metersApi } from '../utils/api'
import TooltipMarkerComponent from './TooltipMarkerComponent';
import { State } from '../types/redux/state';
import { useSelector } from 'react-redux';

interface ExportProps {
	exportVals: { datasets: ExportDataSet[] };
}

export default function ExportComponent(props: ExportProps) {
	/**
	 * Called when Export button is clicked.
	 * Passes an object containing the selected meter data to a function for export.
	 */
	// Meters state
	const metersState = useSelector((state: State) => state.meters.byMeterID);
	// Units state
	const unitsState = useSelector((state: State) => state.units.units);
	// graph state
	const graphState = useSelector((state: State) => state.graph);
	// admin state
	const adminState = useSelector((state: State) => state.admin);

	const exportReading = () => {
		const data = []
		//using a loop to push objects one at a time into data to be organized and formatted for export
		for (let i = 0; i < props.exportVals.datasets.length; i++) {
			data.push(props.exportVals.datasets[i]);

			// Sort the dataset based on the start time
			data.forEach(reading => {
				if (reading !== undefined) {
					reading.exportVals.sort((a, b) => {
						if (a.x < b.x) {
							return -1;
						}
						return 1;
					})
				}
			})

			// Determine and format the first time in the dataset
			// These values are already UTC so they are okay. Why has not been tracked down.
			let startTime = moment(data[0].exportVals[0].x);
			for (const reading of data) {
				if (reading !== undefined) {
					const startTimeOfDataset = moment(reading.exportVals[0].x);
					if (startTime.isAfter(startTimeOfDataset)) {
						startTime = startTimeOfDataset;
					}
				}
			}

			// Determine and format the last time in the dataset
			let endTime = moment(data[0].exportVals[data[0].exportVals.length - 1].x);
			for (const reading of data) {
				if (reading !== undefined) {
					const endTimeOfDataset = moment(reading.exportVals[reading.exportVals.length - 1].x);
					if (endTimeOfDataset.isAfter(endTime)) {
						endTime = endTimeOfDataset;
					}
				}
			}
			// Use regex to remove commas and replace spaces/colons/hyphens with underscores
			const startTimeString = startTime.utc().format('LL_LTS').replace(/,/g, '').replace(/[\s:-]/g, '_');
			const endTimeString = endTime.utc().format('LL_LTS').replace(/,/g, '').replace(/[\s:-]/g, '_');
			const chartName = data[0].currentChart;
			const meterName = data[0].label;
			const unit = data[0].unit;
			const name = `oedExport_${chartName}_${startTimeString}_to_${endTimeString}_${meterName}_${unit}.csv`;
			graphExport(data, name);
			//clear out exported data so a new object can be pushed in
			data.splice(0, data.length);
		}
	};

	const exportRawReadings = async () => {
		if (graphState.selectedMeters.length === 0)
			return;
		const data: number[] = []
		for (let i = 0; i < graphState.selectedMeters.length; i++) {
			data.push(graphState.selectedMeters[i]);
			const meterID = metersState[graphState.selectedMeters[i]].unitId;
			const unitName = unitsState[meterID].identifier;

			const count = await metersApi.lineReadingsCount(graphState.selectedMeters, graphState.timeInterval);
			graphRawExport(count, adminState.defaultWarningFileSize, adminState.defaultFileSizeLimit, async () => {
				const lineReading = await metersApi.rawLineReadings(data, graphState.timeInterval);
				downloadRawCSV(lineReading, unitName);
			});
			data.splice(0, data.length);
		}
	}

	return (
		<>
			<div>
				<Button outline onClick={exportReading}>
					<FormattedMessage id='export.graph.data' />
				</Button>
				<TooltipMarkerComponent page='home' helpTextId='help.home.export.graph.data' />
			</div>
			{/* Only raw export if a line graph */}
			{graphState.chartToRender === 'line' ? <div style={{ paddingTop: '10px' }}>
				<Button outline onClick={exportRawReadings}>
					<FormattedMessage id='export.raw.graph.data' />
				</Button>
			</div> : ''}
		</>
	);
}
