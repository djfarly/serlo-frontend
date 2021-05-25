import { faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NextPage } from 'next'
import Head from 'next/head'
import * as React from 'react'
import styled from 'styled-components'

import AuthorBadge from '@/assets-webkit/img/community/badge-author.svg'
import DonorBadge from '@/assets-webkit/img/community/badge-donor.svg'
import ReviewerBadge from '@/assets-webkit/img/community/badge-reviewer.svg'
import { useAuthentication } from '@/auth/use-authentication'
import { CommentArea } from '@/components/comments/comment-area'
import { StyledA } from '@/components/tags/styled-a'
import { StyledH1 } from '@/components/tags/styled-h1'
import { StyledH2 } from '@/components/tags/styled-h2'
import { StyledLi } from '@/components/tags/styled-li'
import { StyledOl } from '@/components/tags/styled-ol'
import { StyledP } from '@/components/tags/styled-p'
import { TimeAgo } from '@/components/time-ago'
import { CloseButton, StyledModal } from '@/components/user-tools/share-modal'
import { UserTools } from '@/components/user-tools/user-tools'
import { useInstanceData } from '@/contexts/instance-context'
import { UserPage } from '@/data-types'
import { makeGreenButton, makeMargin } from '@/helper/css'
import { renderArticle } from '@/schema/article-renderer'

export interface ProfileProps {
  userData: UserPage['userData']
}

export const Profile: NextPage<ProfileProps> = ({ userData }) => {
  const { strings } = useInstanceData()
  const { id, username, description, lastLogin, imageUrl, date } = userData
  const { activeDonor, activeReviewer, activeAuthor } = userData
  const auth = useAuthentication()
  const isOwnProfile = auth.current?.username === username
  const lastLoginDate = lastLogin ? new Date(lastLogin) : undefined
  const registerDate = new Date(date)
  const [howToEditImage, setHowToEditImage] = React.useState(false)

  return (
    <>
      <Head>
        <title>{username}</title>
        {!activeDonor && !activeAuthor && !activeReviewer && (
          <meta name="robots" content="noindex" />
        )}
      </Head>

      <ProfileHeader>
        {renderProfileImage()}
        <div>
          <UsernameHeading>{username}</UsernameHeading>
          <StyledP>
            {strings.profiles.activeSince}{' '}
            <time
              dateTime={registerDate.toISOString()}
              title={registerDate.toLocaleDateString()}
            >
              {registerDate.getFullYear()}
            </time>
          </StyledP>
        </div>
        {renderBadges()}
      </ProfileHeader>

      {description && (
        <>
          <StyledH2>{strings.profiles.aboutMe}</StyledH2>
          {renderArticle(description, `profile${id}`)}
        </>
      )}
      <CommentArea id={id} noForms />
      {lastLoginDate && (
        <Gray>
          {strings.profiles.lastLogin}:{' '}
          <b>
            <TimeAgo datetime={lastLoginDate} dateAsTitle />
          </b>
        </Gray>
      )}
      {renderUserTools()}
      {renderHowToEditImage()}
    </>
  )

  function renderBadges() {
    if (!activeAuthor && !activeReviewer && !activeDonor) return null

    return (
      <BadgesContainer>
        {activeReviewer &&
          renderBadge({ Badge: ReviewerBadge, name: strings.roles.reviewer })}
        {activeAuthor &&
          renderBadge({ Badge: AuthorBadge, name: strings.roles.author })}
        {activeDonor &&
          renderBadge({ Badge: DonorBadge, name: strings.roles.donor })}
      </BadgesContainer>
    )
  }

  function renderBadge({
    Badge,
    name,
  }: {
    Badge: typeof ReviewerBadge | typeof AuthorBadge | typeof DonorBadge
    name: string
  }) {
    return (
      <BadgeContainer>
        <Badge />
        <StyledP>{name}</StyledP>
      </BadgeContainer>
    )
  }

  function renderUserTools() {
    return (
      <UserTools
        id={id}
        hideEditProfile={!isOwnProfile}
        data={{
          type: 'Profile',
          id: id,
        }}
      />
    )
  }

  function renderProfileImage() {
    return (
      <ProfileImageCage>
        <ProfileImage src={imageUrl} />
        {isOwnProfile && (
          <ProfileImageEditButton onClick={() => setHowToEditImage(true)}>
            <FontAwesomeIcon icon={faPencilAlt} />
          </ProfileImageEditButton>
        )}
      </ProfileImageCage>
    )
  }

  function renderHowToEditImage() {
    return (
      <StyledModal
        isOpen={howToEditImage}
        onRequestClose={() => setHowToEditImage(false)}
      >
        <StyledH2>How to edit your profile picture</StyledH2>
        <StyledP>
          Currently we use the images from{' '}
          <StyledA href="https://community.serlo.org">
            community.serlo.org
          </StyledA>{' '}
          as profile pictures. In order to change your picture, do the
          following:
        </StyledP>
        <StyledOl>
          <StyledLi>
            Go to{' '}
            <StyledA href="https://community.serlo.org">
              community.serlo.org
            </StyledA>
          </StyledLi>
          <StyledLi>Sign in.</StyledLi>
          <StyledLi>
            Go to{' '}
            <StyledA href="https://community.serlo.org/account/profile">
              My Account
            </StyledA>{' '}
            in the user menu.
          </StyledLi>
          <StyledLi>
            Upload a new profile picture and click &quot;Save changes&quot;.
          </StyledLi>
        </StyledOl>
        {/*TODO: Should be merged in a common Modal*/}
        <CloseButton onClick={() => setHowToEditImage(false)}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </CloseButton>
      </StyledModal>
    )
  }
}

const ProfileImageEditButton = styled.button`
  ${makeGreenButton}
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 2em;
  height: 2em;
  background-color: ${(props) => props.theme.colors.brandGreen};
  color: ${(props) => props.theme.colors.white};

  &:focus {
    outline: 2px dotted ${(props) => props.theme.colors.brand};
  }
`

const ProfileImageCage = styled.figure`
  width: 150px;
  height: 150px;
  contain: content;

  & > * {
    display: block;
  }
`

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 100%;
  height: 100%;
`

const BadgesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const BadgeContainer = styled.div`
  margin-right: 20px;

  & > * {
    display: block;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
`

const ProfileHeader = styled.header`
  ${makeMargin}
  margin-top: 40px;
  margin-bottom: 30px;

  @media (min-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    & > * {
      margin-right: 20px;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    & > * {
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
  }

  & ${BadgeContainer} > svg,
  & h1 {
    height: 40px;
    margin-top: 15px;
    margin-bottom: 10px;
  }
`

const UsernameHeading = styled(StyledH1)`
  font-weight: normal;
`

const Gray = styled(StyledP)`
  margin-top: 70px;
  font-size: 0.9rem;
  color: #777;
`
