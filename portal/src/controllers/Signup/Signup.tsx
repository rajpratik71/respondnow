import React, { useState } from 'react';
import SignupView from '@views/Signup';
import { useSignupMutation } from '@services/server/hooks/useSignupMutation';

const SignupController: React.FC = () => {
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const { mutate: signupMutation, isLoading: signupMutationLoading } = useSignupMutation(
    {},
    {
      onSuccess: signupData => {
        if (signupData.status === 'success') {
          setSignupSuccess(signupData.message);
        }
      }
    }
  );

  return (
    <SignupView 
      mutation={signupMutation} 
      loading={signupMutationLoading} 
      successMessage={signupSuccess}
    />
  );
};

export default SignupController;
