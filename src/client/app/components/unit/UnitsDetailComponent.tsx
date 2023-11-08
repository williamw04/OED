/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { QueryStatus } from '@reduxjs/toolkit/query';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import SpinnerComponent from '../../components/SpinnerComponent';
import TooltipHelpComponent from '../../components/TooltipHelpComponent';
import { selectUnitDataByIdQueryState } from '../../redux/api/unitsApi';
import { useAppSelector } from '../../redux/hooks';
import TooltipMarkerComponent from '../TooltipMarkerComponent';
import CreateUnitModalComponent from './CreateUnitModalComponent';
import UnitViewComponent from './UnitViewComponent';

/**
 * Defines the units page card view
 * @returns Units page element
 */
export default function UnitsDetailComponent() {
	// The route stops you from getting to this page if not an admin.

	//Units state
	const { data: unitDataById = {}, status } = useAppSelector(selectUnitDataByIdQueryState);


	return (
		<div>
			{status === QueryStatus.pending ? (
				<div className='text-center'>
					<SpinnerComponent loading width={50} height={50} />
					<FormattedMessage id='redo.cik.and.refresh.db.views'></FormattedMessage>
				</div>
			) : (
				<div>
					<TooltipHelpComponent page='units' />

					<div className='container-fluid'>
						<h2 style={titleStyle}>
							<FormattedMessage id='units' />
							<div style={tooltipStyle}>
								<TooltipMarkerComponent page='units' helpTextId={tooltipStyle.tooltipUnitView} />
							</div>
						</h2>
						<div className="edit-btn">
							{/* The actual button for create is inside this component. */}
							< CreateUnitModalComponent />
						</div>
						<div className="card-container">
							{/* Create a UnitViewComponent for each UnitData in Units State after sorting by identifier */}
							{
								Object.values(unitDataById)
									.sort((unitA, unitB) => (unitA.identifier.toLowerCase() > unitB.identifier.toLowerCase()) ? 1 :
										((unitB.identifier.toLowerCase() > unitA.identifier.toLowerCase()) ? -1 : 0))
									.map(unitData => (
										<UnitViewComponent
											key={unitData.id}
											unit={unitData}
										/>
									))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const titleStyle: React.CSSProperties = {
	textAlign: 'center'
};

const tooltipStyle = {
	display: 'inline-block',
	fontSize: '50%',
	// For now, only an admin can see the unit page.
	tooltipUnitView: 'help.admin.unitview'
};
