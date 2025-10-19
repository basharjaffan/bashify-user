import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/UserAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Vänligen fyll i både email och lösenord');
      return;
    }

    try {
      await login(email, password);
      toast.success('Inloggad!');
      navigate('/device');
    } catch (error) {
      toast.error('Inloggning misslyckades');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="mx-auto w-14 h-14 rounded-lg bg-primary flex items-center justify-center">
            <Music2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Bashify</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Music System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Lösenord</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loggar in...
                </>
              ) : (
                'Logga in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;
