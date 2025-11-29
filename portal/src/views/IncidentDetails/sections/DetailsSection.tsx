import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Avatar, Card, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import SeverityBadge from '@components/SeverityBadge';
import StatusBadge from '@components/StatusBadge';
import { Incident } from '@services/server';
import Duration from '@components/Duration';
import SlackIcon from '@images/slack.svg';
import moment from 'moment';
import css from '../IncidentDetails.module.scss';

interface DetailsSectionProps {
  incidentData: Incident | undefined;
}

const DetailsSection: React.FC<DetailsSectionProps> = props => {
  const { incidentData } = props;
  const { getString } = useStrings();

  return (
    <Card className={css.detailsCardContainer}>
      <Layout.Vertical width="100%" height="100%" padding="medium" className={css.detailsSectionContainer}>
        <Layout.Vertical
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          className={css.internalContainers}
          width="100%"
        >
          <Text font={{ variation: FontVariation.H6 }}>{getString('severity')}</Text>
          <SeverityBadge severity={incidentData?.severity} />
        </Layout.Vertical>
        <Layout.Horizontal width="100%" style={{ gap: '1rem' }}>
          <Layout.Vertical
            flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            className={css.internalContainers}
            width="calc(50% - 8px)"
          >
            <Text font={{ variation: FontVariation.H6 }}>{getString('status')}</Text>
            <StatusBadge status={incidentData?.status} />
          </Layout.Vertical>
          <Layout.Vertical
            flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            className={css.internalContainers}
            width="calc(50% - 8px)"
          >
            <Text font={{ variation: FontVariation.H6 }}>{getString('duration')}</Text>
            {incidentData?.createdAt && incidentData?.updatedAt && incidentData.status && (
              <Duration
                icon={'timer'}
                iconProps={{
                  size: 12
                }}
                font={{ variation: FontVariation.SMALL }}
                color={Color.GREY_800}
                startTime={incidentData?.createdAt * 1000}
                endTime={incidentData.status === 'Resolved' ? incidentData?.updatedAt * 1000 : undefined}
                durationText=""
              />
            )}
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          className={css.internalContainers}
          width="100%"
        >
          <Text font={{ variation: FontVariation.H6 }}>{getString('summary')}</Text>
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
            {incidentData?.summary || getString('abbv.na')}
          </Text>
        </Layout.Vertical>
        <Layout.Vertical
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          className={css.internalContainers}
          width="100%"
        >
          <Text font={{ variation: FontVariation.H6 }}>{getString('keyMembers')}</Text>
          <Layout.Vertical width="100%" style={{ gap: '0.25rem' }}>
            {incidentData?.roles?.map(member => (
              <Layout.Horizontal
                key={member.userDetails?.userName}
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              >
                <Avatar hoverCard={false} src={SlackIcon} size="small" />
                <Layout.Vertical>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
                    {member.userDetails?.name || member.userDetails?.userName}
                  </Text>
                  <Text font={{ variation: FontVariation.TINY, italic: true }} color={Color.GREY_500}>
                    {member.roleType}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
            ))}
          </Layout.Vertical>
        </Layout.Vertical>
        <Layout.Vertical
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          className={css.internalContainers}
          width="100%"
        >
          <Text font={{ variation: FontVariation.H6 }}>{getString('tags')}</Text>
          <Layout.Horizontal width="100%" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {incidentData?.tags && incidentData.tags?.length > 0 ? (
              incidentData?.tags?.map(tag => (
                <Container
                  key={tag}
                  padding={{ left: 'small', right: 'small' }}
                  style={{ borderRadius: 3, background: '#D7CFF9' }}
                  flex={{ alignItems: 'center' }}
                  height={20}
                >
                  <Text font={{ variation: FontVariation.TINY_SEMI }}>{tag}</Text>
                </Container>
              ))
            ) : (
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800} style={{ lineHeight: 1 }}>
                {getString('abbv.na')}
              </Text>
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
        {incidentData?.incidentUrl && (
          <Layout.Vertical
            flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            className={css.internalContainers}
            width="100%"
          >
            <Text font={{ variation: FontVariation.H6 }}>{getString('links')}</Text>
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              style={{ gap: '0.25rem', cursor: 'pointer' }}
              onClick={() => window.open(incidentData.incidentUrl, '_blank')}
            >
              <Icon name="link" size={12} color={Color.PRIMARY_7} />
              <Text 
                font={{ variation: FontVariation.SMALL }} 
                color={Color.PRIMARY_7}
                style={{ textDecoration: 'underline' }}
              >
                {incidentData.incidentUrl}
              </Text>
              <Icon name="share" size={10} color={Color.PRIMARY_7} />
            </Layout.Horizontal>
          </Layout.Vertical>
        )}

        {/* Audit Information */}
        {incidentData && (
          <Layout.Vertical
            flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            className={css.internalContainers}
            width="100%"
            style={{ borderTop: '1px solid #d9dae5', paddingTop: '1rem', marginTop: '0.5rem' }}
          >
            <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'small' }}>
              Audit Information
            </Text>
            <Layout.Horizontal width="100%" style={{ gap: '2rem', flexWrap: 'wrap' }}>
              <Layout.Vertical spacing="xsmall" style={{ minWidth: '150px' }}>
                <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
                  Created By
                </Text>
                <Text color={Color.GREY_900}>
                  {incidentData.createdBy?.name || incidentData.createdBy?.userName || '-'}
                </Text>
              </Layout.Vertical>
              <Layout.Vertical spacing="xsmall" style={{ minWidth: '150px' }}>
                <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
                  Created At
                </Text>
                <Text color={Color.GREY_900}>
                  {incidentData.createdAt ? moment(incidentData.createdAt * 1000).format('MMM D, YYYY h:mm A') : '-'}
                </Text>
              </Layout.Vertical>
              {incidentData.updatedBy && (
                <>
                  <Layout.Vertical spacing="xsmall" style={{ minWidth: '150px' }}>
                    <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
                      Updated By
                    </Text>
                    <Text color={Color.GREY_900}>
                      {incidentData.updatedBy?.name || incidentData.updatedBy?.userName || '-'}
                    </Text>
                  </Layout.Vertical>
                  <Layout.Vertical spacing="xsmall" style={{ minWidth: '150px' }}>
                    <Text color={Color.GREY_500} font={{ size: 'small', weight: 'semi-bold' }}>
                      Updated At
                    </Text>
                    <Text color={Color.GREY_900}>
                      {incidentData.updatedAt ? moment(incidentData.updatedAt * 1000).format('MMM D, YYYY h:mm A') : '-'}
                    </Text>
                  </Layout.Vertical>
                </>
              )}
            </Layout.Horizontal>
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Card>
  );
};

export default withErrorBoundary(DetailsSection, { FallbackComponent: Fallback });
