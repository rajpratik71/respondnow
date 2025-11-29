import React from 'react';
import { Button, ButtonVariation, Card, Container, FormInput, Layout, Text, useToaster } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { UseMutateFunction } from '@tanstack/react-query';
import { withErrorBoundary } from 'react-error-boundary';
import { useHistory } from 'react-router-dom';
import mainLogo from '@images/respondNow.svg';
import { useStrings } from '@strings';
import PasswordInput from '@components/PasswordInput';
import { SignupMutationProps, SignupResponseDto } from '@services/server';
import { Fallback } from '@errors';
import { paths } from '@routes/RouteDefinitions';
import css from '../Login/Login.module.scss';

interface SignupViewProps {
  mutation: UseMutateFunction<SignupResponseDto, SignupResponseDto, SignupMutationProps<never>, unknown>;
  loading: boolean;
  successMessage: string | null;
}

interface SignupFormProps {
  name: string;
  email: string;
  userId: string;
  password: string;
  confirmPassword: string;
}

const SignupView: React.FC<SignupViewProps> = props => {
  const { mutation, loading, successMessage } = props;
  const { getString } = useStrings();
  const { showError } = useToaster();
  const history = useHistory();

  // Show success message if signup completed
  if (successMessage) {
    return (
      <Container height="100%" background={Color.PRIMARY_BG} flex={{ align: 'center-center' }}>
        <Card className={css.loginCardContainer}>
          <Layout.Vertical flex={{ alignItems: 'center', justifyContent: 'space-between' }} height="100%">
            <Layout.Vertical width="100%" spacing="medium" style={{ textAlign: 'center' }}>
              <img src={mainLogo} alt="RespondNow" height={40} />
              <Text font={{ variation: FontVariation.H4 }} color={Color.SUCCESS}>
                Account Created Successfully!
              </Text>
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} padding={{ top: 'small', bottom: 'small' }}>
                {successMessage}
              </Text>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_400}>
                An administrator will review your account and activate it soon. You'll be notified via email once your account is approved.
              </Text>
            </Layout.Vertical>
            <Button
              text="Back to Login"
              variation={ButtonVariation.PRIMARY}
              width="100%"
              onClick={() => history.push(paths.toLogin())}
            />
          </Layout.Vertical>
        </Card>
      </Container>
    );
  }

  return (
    <Container height="100%" background={Color.PRIMARY_BG} flex={{ align: 'center-center' }}>
      <Card className={css.loginCardContainer}>
        <Layout.Vertical flex={{ alignItems: 'center', justifyContent: 'space-between' }} height="100%">
          <Layout.Vertical width="100%" spacing="small">
            <img src={mainLogo} alt="RespondNow" height={40} />
            <Text font={{ variation: FontVariation.H6, align: 'center' }} color={Color.GREY_400}>
              Create your RespondNow account
            </Text>
          </Layout.Vertical>
          <Formik<SignupFormProps>
            initialValues={{ name: '', email: '', userId: '', password: '', confirmPassword: '' }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required'),
              email: Yup.string().email(getString('emailInvalid')).required(getString('emailRequired')),
              userId: Yup.string()
                .required('Username is required')
                .min(3, 'Username must be at least 3 characters')
                .matches(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
              password: Yup.string()
                .required(getString('passwordRequired'))
                .min(8, 'Password must be at least 8 characters'),
              confirmPassword: Yup.string()
                .required('Please confirm your password')
                .oneOf([Yup.ref('password')], 'Passwords must match')
            })}
            onSubmit={values => {
              mutation(
                {
                  queryParams: {},
                  body: {
                    name: values.name,
                    email: values.email,
                    userId: values.userId,
                    password: values.password
                  }
                },
                {
                  onError: error => showError(error.message || 'Signup failed')
                }
              );
            }}
          >
            <Form className={css.formContainer}>
              <FormInput.Text
                name="name"
                placeholder="Enter your full name"
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Full Name</Text>}
              />
              <FormInput.Text
                name="email"
                inputGroup={{
                  type: 'email'
                }}
                placeholder={`${getString('enter')} ${getString('email')}`}
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('email')}</Text>}
              />
              <FormInput.Text
                name="userId"
                placeholder="Choose a username"
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Username</Text>}
              />
              <PasswordInput
                name="password"
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('password')}</Text>}
                placeholder={`${getString('enter')} ${getString('password')}`}
                disabled={false}
              />
              <PasswordInput
                name="confirmPassword"
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Confirm Password</Text>}
                placeholder="Re-enter your password"
                disabled={false}
              />
              <Button
                type="submit"
                text="Sign Up"
                variation={ButtonVariation.PRIMARY}
                width="100%"
                disabled={loading}
                loading={loading}
              />
            </Form>
          </Formik>
          <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xsmall">
            <Text font={{ variation: FontVariation.SMALL_SEMI }}>Already have an account?</Text>
            <Text
              font={{ variation: FontVariation.SMALL_SEMI }}
              color={Color.PRIMARY_7}
              style={{ cursor: 'pointer' }}
              onClick={() => history.push(paths.toLogin())}
            >
              Log In
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Card>
    </Container>
  );
};

export default withErrorBoundary(SignupView, { FallbackComponent: Fallback });
