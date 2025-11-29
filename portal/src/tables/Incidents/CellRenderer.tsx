import React from 'react';
import { CellProps, Renderer } from 'react-table';
import { Avatar, Button, ButtonSize, ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { Link } from 'react-router-dom';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { isEmpty } from 'lodash-es';
import { Incident } from '@services/server';
import { useStrings } from '@strings';
import SeverityBadge from '@components/SeverityBadge';
import { paths } from '@routes/RouteDefinitions';
import { generateSlackChannelLink, getDetailedTime } from '@utils';
import StatusBadge from '@components/StatusBadge';
import SlackIcon from '@images/slack.svg';
import SlackIconMono from '@images/slack-mono.svg';
import Duration from '@components/Duration';
import moment from 'moment';
import css from '../CommonTableStyles.module.scss';

type CellRendererType = Renderer<CellProps<Incident>>;

export const IncidentsName: CellRendererType = ({ row }) => {
  const { getString } = useStrings();
  const { name, severity, description, tags, id } = row.original;
  return (
    <Layout.Horizontal
      height={66}
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      width="100%"
      spacing="medium"
    >
      <SeverityBadge severity={severity} />
      <Container className={css.incidentsNameContainer}>
        <Link
          to={paths.toIncidentDetails({
            incidentId: id || ''
          })}
          className={css.textLink}
        >
          <Layout.Horizontal spacing="xsmall">
            <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, weight: 'bold' }} lineClamp={1}>
              {`#${row.index + 1} -`}
            </Text>
            <Text color={Color.PRIMARY_5} font={{ variation: FontVariation.BODY, weight: 'bold' }} lineClamp={1}>
              {name || getString('abbv.na')}
            </Text>
          </Layout.Horizontal>
        </Link>
        {description && (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ marginTop: 2 }}>
            <Text font={{ variation: FontVariation.TINY }} style={{ fontSize: 11 }} color={Color.GREY_500}>
              &quot;
            </Text>
            <Text
              font={{ variation: FontVariation.TINY }}
              style={{ fontSize: 11 }}
              color={Color.GREY_500}
              lineClamp={1}
            >
              {description}
            </Text>
            <Text
              font={{ variation: FontVariation.TINY }}
              style={{ fontSize: 11 }}
              color={Color.GREY_500}
              lineClamp={1}
            >
              &quot;
            </Text>
          </Layout.Horizontal>
        )}
        {tags && !isEmpty(tags) && (
          <Layout.Horizontal spacing={'small'} style={{ flexWrap: 'wrap', gap: '2px', marginTop: 12 }}>
            {tags?.slice(0, 2)?.map(tag => (
              <Container
                key={tag}
                padding={{ left: 'small', right: 'small', top: 'xsmall', bottom: 'xsmall' }}
                style={{ borderRadius: 3, background: '#EDE9FE' }}
                flex={{ alignItems: 'center' }}
                height={16}
              >
                <Text color={Color.GREY_600} font={{ variation: FontVariation.TINY_SEMI }}>
                  {tag}
                </Text>
              </Container>
            )) ?? <Text font={{ variation: FontVariation.TINY_SEMI }}>{getString('abbv.na')}</Text>}
            {tags.length - 2 > 0 && (
              <Container
                padding={{ left: 'small', right: 'small', top: 'xsmall', bottom: 'xsmall' }}
                style={{ borderRadius: 3, background: '#EDE9FE' }}
                flex={{ alignItems: 'center' }}
                height={24}
              >
                <Text
                  style={{ cursor: 'pointer' }}
                  color={Color.GREY_600}
                  font={{ variation: FontVariation.SMALL_SEMI }}
                >
                  +{tags.length - 2}
                </Text>
              </Container>
            )}
          </Layout.Horizontal>
        )}
      </Container>
    </Layout.Horizontal>
  );
};

export const IncidentReportedBy: CellRendererType = ({ row }) => {
  const { getString } = useStrings();
  const { createdBy, createdAt } = row.original;
  const name = createdBy?.name || createdBy?.userName;
  const source = createdBy?.source || 'Web';
  const isSlackSource = source === 'Slack';
  
  return (
    <Container flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width="100%">
      {isSlackSource ? (
        <Avatar borderRadius={0} src={SlackIcon} name={createdBy?.name} hoverCard={false} size="small" />
      ) : (
        <Container 
          width={24} 
          height={24} 
          flex={{ alignItems: 'center', justifyContent: 'center' }}
          style={{ borderRadius: 4, backgroundColor: '#E3E7EE' }}
        >
          <Icon name="globe" size={14} color={Color.PRIMARY_7} />
        </Container>
      )}
      <Layout.Vertical margin={{ left: 'xsmall' }}>
        <Text font={{ variation: FontVariation.SMALL }} lineClamp={1} color={Color.GREY_700}>
          {name ? `${name}, via ${source}` : getString('abbv.na')}
        </Text>
        {createdAt && (
          <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_400}>
            {getDetailedTime(createdAt * 1000, true)}
          </Text>
        )}
      </Layout.Vertical>
    </Container>
  );
};

export const IncidentStatus: CellRendererType = ({ row }) => {
  const { status } = row.original;
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <StatusBadge status={status} />
    </Layout.Horizontal>
  );
};

export const IncidentDuration: CellRendererType = ({ row }) => {
  const { createdAt, updatedAt, status } = row.original;
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width="100%" spacing="small">
      {createdAt && updatedAt && (
        <Duration
          icon={'timer'}
          iconProps={{
            size: 12
          }}
          font={{ variation: FontVariation.SMALL, weight: 'light' }}
          color={Color.GREY_800}
          startTime={createdAt * 1000}
          endTime={status === 'Resolved' ? updatedAt * 1000 : undefined}
          durationText=""
        />
      )}
    </Layout.Horizontal>
  );
};

export const IncidentLink: CellRendererType = ({ row }) => {
  const { incidentUrl } = row.original;
  
  if (!incidentUrl) {
    return null;
  }

  // Truncate URL for display if too long
  const displayUrl = incidentUrl.length > 30 
    ? `${incidentUrl.substring(0, 30)}...` 
    : incidentUrl;

  return (
    <Layout.Horizontal 
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }} 
      style={{ gap: '0.25rem', cursor: 'pointer' }}
      onClick={() => window.open(incidentUrl, '_blank')}
    >
      <Icon name="link" size={12} color={Color.PRIMARY_7} />
      <Text 
        font={{ variation: FontVariation.SMALL }} 
        color={Color.PRIMARY_7}
        style={{ textDecoration: 'underline' }}
        title={incidentUrl}
      >
        {displayUrl}
      </Text>
      <Icon name="share" size={10} color={Color.PRIMARY_7} />
    </Layout.Horizontal>
  );
};

export const IncidentCTA: CellRendererType = ({ row }) => {
  const { channels, incidentChannel, incidentUrl } = row.original;
  const { getString } = useStrings();
  
  const hasSlackChannel = incidentChannel?.slack?.teamDomain && channels?.[0]?.id;
  
  // Show Slack button if Slack is configured
  if (hasSlackChannel) {
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Button
          icon={<img src={SlackIconMono} height={12} />}
          onClick={() => {
            window.open(
              generateSlackChannelLink(incidentChannel?.slack?.teamDomain || '', channels?.[0].id || ''),
              '_blank'
            );
          }}
          size={ButtonSize.SMALL}
          text={
            <Text font={{ variation: FontVariation.SMALL_BOLD }} style={{ lineHeight: 1 }} color={Color.PRIMARY_7}>
              {getString('viewChannel')}
            </Text>
          }
          variation={ButtonVariation.SECONDARY}
        />
      </Layout.Horizontal>
    );
  }
  
  // Show incident URL button if available
  if (incidentUrl) {
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Button
          rightIcon="share"
          onClick={() => window.open(incidentUrl, '_blank')}
          size={ButtonSize.SMALL}
          text={
            <Text font={{ variation: FontVariation.SMALL_BOLD }} style={{ lineHeight: 1 }} color={Color.PRIMARY_7}>
              View URL
            </Text>
          }
          variation={ButtonVariation.SECONDARY}
        />
      </Layout.Horizontal>
    );
  }
  
  // No external link available
  return null;
};

export const IncidentCreatedBy: CellRendererType = ({ row }) => {
  const { createdBy } = row.original;
  const displayName = createdBy?.name || createdBy?.userName || '-';
  
  return (
    <Layout.Horizontal
      height={66}
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      spacing="small"
    >
      {createdBy && (
        <Avatar name={displayName} size="small" hoverCard={false} />
      )}
      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }} lineClamp={1}>
        {displayName}
      </Text>
    </Layout.Horizontal>
  );
};

export const IncidentUpdatedAt: CellRendererType = ({ row }) => {
  const { updatedAt } = row.original;
  
  return (
    <Layout.Horizontal
      height={66}
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY }}>
        {updatedAt ? moment(updatedAt * 1000).format('MMM D, YYYY h:mm A') : '-'}
      </Text>
    </Layout.Horizontal>
  );
};
