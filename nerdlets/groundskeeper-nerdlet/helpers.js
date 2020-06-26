import React from 'react';
import { Link, navigation } from 'nr1';
import { subWeeks, subMonths, isSameDay, isBefore } from 'date-fns';

function linkedAppId(accountId, appId, guid) {
  let entityGuid = btoa(`${accountId}|APM|APPLICATION|${appId}`);
  while (entityGuid.endsWith('=')) {
    entityGuid = entityGuid.slice(0, -1);
  }
  //let location = navigation.getOpenStackedEntityLocation(entityGuid);
  const location = (guid.startsWith("http")) ? guid : navigation.getOpenStackedEntityLocation(entityGuid);
  return <Link to={location}>{appId}</Link>;
}

function agentAge(a, agentVersions) {
  const langVersions = agentVersions[a.language];
  const reportedVersion = a.agentVersions[0];
  if (!reportedVersion) {
    return undefined;
  }

  // sometimes agents include build numbers but the docs don't
  // so we'll be tolerant of matching on the first 3 segments of a semver
  const mNumberedVersion = reportedVersion.match(/(\d+\.\d+\.\d+)\.\d+$/);
  const numberedVersion =
    mNumberedVersion && mNumberedVersion[1] ? mNumberedVersion[1] : undefined;

  // sometimes agent versions in the docs API don't include a trailing `.0`
  // so we'll be tolerant of a match after stripping `.0` suffix from the shortest variant of the reported version
  const mShortVersion = (numberedVersion || reportedVersion).match(/(.+)\.0$/);
  const shortVersion =
    mShortVersion && mShortVersion[1] ? mShortVersion[1] : undefined;

  const agentVersion = langVersions
    ? langVersions.find(
        v =>
          v.version === reportedVersion ||
          v.version === numberedVersion ||
          v.version === shortVersion
      )
    : '';
  return agentVersion ? agentVersion.date : undefined;
}

function agentVersionInList(version, versionList) {
  if (!version) {
    return false;
  }

  // sometimes agents include build numbers but the docs don't
  // so we'll be tolerant of matching on the first 3 segments of a semver
  const mNumberedVersion = version.match(/(\d+\.\d+\.\d+)\.\d+$/);
  const numberedVersion =
    mNumberedVersion && mNumberedVersion[1] ? mNumberedVersion[1] : undefined;

  // sometimes agent versions in the docs API don't include a trailing `.0`
  // so we'll be tolerant of a match after stripping `.0` suffix from the shortest variant of the reported version
  const mShortVersion = (numberedVersion || version).match(/(.+)\.0$/);
  const shortVersion =
    mShortVersion && mShortVersion[1] ? mShortVersion[1] : undefined;

  const agentVersion = versionList
    ? versionList.find(
        v =>
          (version && v === version) ||
          (numberedVersion && v === numberedVersion) ||
          (shortVersion && v === shortVersion)
      )
    : null;

  return !!agentVersion;
}

/**
 * Some agent releases have a `v` prefix on the version number in the New Relic docs.
 * We use this filter to strip those out so the version string matches what's reported by the agent itself.
 * Filter also strips build numbers from semver strings because our docs use them inconsistently.
 */
function cleanAgentVersion(version) {
  const m = (version || '').match(/(\d+\.\d+\.\d+)/);
  if (m && m[1]) {
    return m[1];
  }
  return version;
}

const defaultAgentSloOption = 2;

const agentSloOptions = [
  {
    label: 'the latest agent',
    filterFunc: versions => {
      return [versions[0]];
    }
  },
  {
    label: 'the last 3 agent releases',
    filterFunc: versions => {
      return versions.slice(0, 3);
    }
  },

  {
    label: 'agents < 2 weeks old',
    filterFunc: versions => {
      const fresh = subWeeks(new Date(), 2);
      return versions.filter(
        (ver, index) =>
          index === 0 || isSameDay(fresh, ver.date) || isBefore(fresh, ver.date)
      );
    }
  },
  {
    label: 'agents < 1 month old',
    filterFunc: versions => {
      const fresh = subMonths(new Date(), 1);
      return versions.filter(
        (ver, index) =>
          index === 0 || isSameDay(fresh, ver.date) || isBefore(fresh, ver.date)
      );
    }
  },
  {
    label: 'agents < 6 months old',
    filterFunc: versions => {
      const fresh = subMonths(new Date(), 6);
      return versions.filter(
        (ver, index) =>
          index === 0 || isSameDay(fresh, ver.date) || isBefore(fresh, ver.date)
      );
    }
  },
  {
    label: 'agents < 1 year old (Support cutoff)',
    filterFunc: versions => {
      const fresh = subMonths(new Date(), 12);
      return versions.filter(
        (ver, index) =>
          index === 0 || isSameDay(fresh, ver.date) || isBefore(fresh, ver.date)
      );
    }
  }
];

export {
  linkedAppId,
  agentAge,
  cleanAgentVersion,
  agentVersionInList,
  agentSloOptions,
  defaultAgentSloOption
};
