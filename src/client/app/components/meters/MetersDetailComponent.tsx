/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import TooltipHelpComponent from '../TooltipHelpComponent';
import { useAppSelector } from '../../redux/reduxHooks';
import { selectIsAdmin } from '../../redux/slices/currentUserSlice';
import { selectVisibleMeterAndGroupData } from '../../redux/selectors/adminSelectors';
import '../../styles/card-page.css';
import TooltipMarkerComponent from '../TooltipMarkerComponent';
import CreateMeterModalComponent from './CreateMeterModalComponent';
import MeterViewComponent from './MeterViewComponent';
import { authApi, authPollInterval } from '../../redux/api/authApi';
import { titleStyle } from '../../styles/modalStyle';

/**
 * Defines the meters page card view
 * @returns Meters page element
 */
export default function MetersDetailComponent() {

	// Check for admin status
	const isAdmin = useAppSelector(selectIsAdmin);
	// page may contain admin info so verify admin status while admin is authenticated.
	authApi.useTokenPollQuery(undefined, { skip: !isAdmin, pollingInterval: authPollInterval });
	// We only want displayable meters if non-admins because they still have
	// non-displayable in state.
	const { visibleMeters } = useAppSelector(selectVisibleMeterAndGroupData);

	return (
		<div className='flexGrowOne'>
			<TooltipHelpComponent page='meters' />

			<div className='container-fluid'>
				<h2 style={titleStyle}>
					<FormattedMessage id='meters' />
					<div style={tooltipStyle}>
						<TooltipMarkerComponent page='meters' helpTextId={getToolTipMessage(isAdmin)} />
					</div>
				</h2>
				{isAdmin &&
					<div className="edit-btn">
						<CreateMeterModalComponent />
					</div>
				}
				{
					<div className="card-container">
						{/* Create a MeterViewComponent for each MeterData in Meters State */}
						{Object.values(visibleMeters)
							.map(MeterData => (
								<MeterViewComponent
									key={`${MeterData.id}:${MeterData.identifier}`}
									meter={MeterData}
								/>
							))}
					</div>
				}
			</div>
		</div >
	);
}

const tooltipStyle = {
	display: 'inline-block',
	fontSize: '50%'
};

// Switch help depending if admin or not.
const getToolTipMessage = (isAdmin: boolean) => isAdmin ? 'help.admin.meterview' : 'help.meters.meterview';
