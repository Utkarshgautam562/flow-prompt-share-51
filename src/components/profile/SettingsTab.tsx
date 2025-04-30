
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SettingsTabProps {
  isAnonymous: boolean;
}

const SettingsTab = ({ isAnonymous }: SettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Privacy Settings */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Privacy</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymousMode"
              className="form-checkbox h-5 w-5 text-indigo-600"
              checked={isAnonymous}
              readOnly
            />
            <label htmlFor="anonymousMode" className="text-sm">
              Anonymous Mode
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Toggle anonymous mode in the navbar. When active, your actions won't be associated with your account.
          </p>
        </div>
        
        {/* Account Management */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
          <Button 
            variant="destructive"
            onClick={() => {
              // In a real app, this would show a confirmation dialog
              toast.error("This feature is not implemented yet");
            }}
          >
            Delete Account
          </Button>
          <p className="text-sm text-gray-500">
            This will permanently delete your account and all your data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
