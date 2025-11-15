import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import Messaging from './components/Messaging';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Profile from './components/Profile';
import UsersList from './components/UsersList';
import ChatWithLimits from './components/ChatWithLimits';
import ConversationsWithLimits from './components/ConversationsWithLimits';
import { User, Message, getAllUsers, getConversation, sendMessage, createUser, updateUser, getUserById, getUserByEmail, getUserByAuthId, signInWithGoogle, authenticateWithEmail, signOut, getCurrentAuthUser, supabase } from './lib/supabase';

type Page = 'home' | 'profile' | 'stars' | 'map' | 'faq' | 'messages' | 'auth' | 'onboarding';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<(User & { id: string }) | null>(null);
  const [pendingAuthEmail, setPendingAuthEmail] = useState<string>('');
  const [allUsers, setAllUsers] = useState<(User & { id: string })[]>([]);
  const [selectedUser, setSelectedUser] = useState<(User & { id: string }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authUser = await getCurrentAuthUser();

        if (authUser) {
          const user = await getUserByAuthId(authUser.id);

          if (user && user.id) {
            if (!user.name || !user.age || !user.gender) {
              setPendingAuthEmail(authUser.email || '');
              setCurrentPage('onboarding');
              setIsLoading(false);
              return;
            }

            setUserData(user as User & { id: string });
            setIsLoggedIn(true);
            localStorage.setItem('currentUserId', user.id);
          } else {
            const newUser = await createUser({
              auth_user_id: authUser.id,
              email: authUser.email || '',
              stars: 0,
              level: 'Bronce',
              visible_on_map: false
            });

            if (newUser && newUser.id) {
              setPendingAuthEmail(authUser.email || '');
              setCurrentPage('onboarding');
            }
          }
        } else {
          const savedUserId = localStorage.getItem('currentUserId');
          if (savedUserId) {
            const user = await getUserById(savedUserId);
            if (user && user.id) {
              setUserData(user as User & { id: string });
              setIsLoggedIn(true);
            } else {
              localStorage.removeItem('currentUserId');
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }

      setIsLoading(false);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await getUserByAuthId(session.user.id);
        if (user && user.id) {
          if (!user.name || !user.age || !user.gender) {
            setPendingAuthEmail(session.user.email || '');
            setCurrentPage('onboarding');
          } else {
            setUserData(user as User & { id: string });
            setIsLoggedIn(true);
            localStorage.setItem('currentUserId', user.id);
            setCurrentPage('stars');
          }
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const smoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', smoothScroll);
    return () => document.removeEventListener('click', smoothScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadUsers();
      loadAllMessages();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      loadAllMessages();
      if (selectedUser && userData) {
        loadConversation(userData.id, selectedUser.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoggedIn, selectedUser, userData]);

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users as (User & { id: string })[]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAllMessages = async () => {
    if (!userData) return;
    try {
      const allMsgs: Message[] = [];
      for (const user of allUsers) {
        if (user.id !== userData.id) {
          const conv = await getConversation(userData.id, user.id);
          allMsgs.push(...conv);
        }
      }
      setAllMessages(allMsgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadConversation = async (userId: string, otherUserId: string) => {
    try {
      const conversation = await getConversation(userId, otherUserId);
      setMessages(conversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleAuth = async (email: string, password: string) => {
    try {
      const result = await authenticateWithEmail(email, password);

      if (result.type === 'signup' && result.needsOnboarding) {
        setPendingAuthEmail(email);
        setCurrentPage('onboarding');
      } else {
        const user = await getUserByAuthId(result.user.id);
        if (user && user.id) {
          if (!user.name || !user.age || !user.gender) {
            setPendingAuthEmail(email);
            setCurrentPage('onboarding');
          } else {
            setUserData(user as User & { id: string });
            setIsLoggedIn(true);
            localStorage.setItem('currentUserId', user.id);
            setCurrentPage('stars');
          }
        }
      }
    } catch (error: any) {
      console.error('Error during authentication:', error);
      alert('Error al autenticar. Verifica tus credenciales e intenta de nuevo.');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error with Google auth:', error);
      alert('Error al autenticar con Google. Por favor, intenta de nuevo.');
    }
  };

  const handleOnboardingComplete = async (name: string, age: number, gender: 'hombre' | 'mujer', bio: string) => {
    try {
      const authUser = await getCurrentAuthUser();
      if (!authUser) {
        alert('Error: No se encontró la sesión de autenticación.');
        return;
      }

      const user = await getUserByAuthId(authUser.id);
      if (user && user.id) {
        const updatedUser = await updateUser(user.id, {
          name,
          age,
          gender,
          bio
        });

        if (updatedUser && updatedUser.id) {
          setUserData(updatedUser as User & { id: string });
          setIsLoggedIn(true);
          localStorage.setItem('currentUserId', updatedUser.id);
          setCurrentPage('stars');
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error al completar el perfil. Por favor, intenta de nuevo.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUserData(null);
      setIsLoggedIn(false);
      setSelectedUser(null);
      setMessages([]);
      setAllMessages([]);
      setPendingAuthEmail('');
      localStorage.removeItem('currentUserId');
      setCurrentPage('home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddStar = async () => {
    if (!userData || !userData.id) return;
    const newStars = userData.stars + 1;
    let newLevel = 'Bronce';
    if (newStars >= 31) newLevel = 'Oro';
    else if (newStars >= 11) newLevel = 'Plata';

    try {
      const updatedUser = await updateUser(userData.id, { stars: newStars, level: newLevel });
      if (updatedUser) {
        setUserData(updatedUser as User & { id: string });
      }
    } catch (error) {
      console.error('Error updating stars:', error);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!userData || !userData.id) return;
    const photoUrl = URL.createObjectURL(file);

    try {
      const updatedUser = await updateUser(userData.id, { profile_photo_url: photoUrl });
      if (updatedUser) {
        setUserData(updatedUser as User & { id: string });
      }
    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  const handleBioUpdate = async (bio: string) => {
    if (!userData || !userData.id) return;

    try {
      const updatedUser = await updateUser(userData.id, { bio });
      if (updatedUser) {
        setUserData(updatedUser as User & { id: string });
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleSelectUser = async (user: User & { id: string }) => {
    if (!userData) return;
    setSelectedUser(user);
    await loadConversation(userData.id, user.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!userData || !selectedUser) return;
    try {
      await sendMessage(userData.id, selectedUser.id, content);
      await loadConversation(userData.id, selectedUser.id);
      await loadAllMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendBeer = async (recipientId: string) => {
    if (!userData) return;

    try {
      const { error } = await supabase
        .from('beers_sent')
        .insert({
          sender_id: userData.id,
          recipient_id: recipientId
        });

      if (error) throw error;

      alert('🍺 ¡Cerveza enviada! El usuario recibirá una notificación.');
    } catch (error) {
      console.error('Error sending beer:', error);
      alert('Error al enviar la cerveza. Inténtalo de nuevo.');
    }
  };

  const renderPage = () => {
    if (currentPage === 'onboarding' && pendingAuthEmail) {
      return (
        <div className="min-h-screen bg-white">
          <Onboarding
            email={pendingAuthEmail}
            onComplete={handleOnboardingComplete}
          />
        </div>
      );
    }

    if (!isLoggedIn) {
      switch (currentPage) {
        case 'auth':
          return (
            <div className="min-h-screen bg-white">
              <Auth onAuth={handleAuth} onGoogleAuth={handleGoogleAuth} />
            </div>
          );

        case 'faq':
          return (
            <div className="min-h-screen bg-white">
              <Header
                isLoggedIn={false}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
              />
              <div className="pt-20">
                <FAQ />
              </div>
              <Footer />
            </div>
          );

        case 'home':
        default:
          return (
            <div className="min-h-screen bg-white">
              <Header
                isLoggedIn={false}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
              />
              <div className="pt-20">
                <Hero />
                <HowItWorks />
                <section id="registro" className="py-20 bg-gradient-to-br from-[#C8102E] to-[#8B0A1F]">
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                      ¿Listo para empezar?
                    </h2>
                    <button
                      onClick={() => setCurrentPage('auth')}
                      className="bg-white text-[#C8102E] px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                      Únete al juego
                    </button>
                  </div>
                </section>
              </div>
              <Footer />
            </div>
          );
      }
    }

    switch (currentPage) {
      case 'messages':
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={isLoggedIn}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              userName={userData?.name}
            />
            {userData && (
              <ConversationsWithLimits
                currentUser={userData}
                onSelectUser={handleSelectUser}
              />
            )}
            <Footer />
          </div>
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={isLoggedIn}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              userName={userData?.name}
            />
            <div className="pt-20">
              <section className="py-20 bg-[#F5F5F5] min-h-screen">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
                      Mi Perfil
                    </h2>
                    <p className="text-xl text-[#666666]">
                      Así te ven los demás cazadores de estrellas
                    </p>
                  </div>
                  {userData && (
                    <div className="max-w-4xl mx-auto">
                      <Profile
                        userData={userData}
                        onPhotoUpload={handlePhotoUpload}
                        onBioUpdate={handleBioUpdate}
                        isEditable={true}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>
            <Footer />
          </div>
        );

      case 'stars':
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={isLoggedIn}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              userName={userData?.name}
            />
            <div className="pt-20">
              {isLoggedIn && userData && (
                <>
                  <Dashboard userData={userData} onAddStar={handleAddStar} />
                  <section id="usuarios" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                      <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
                          Conecta con otros cazadores
                        </h2>
                        <p className="text-xl text-[#666666]">
                          Envía mensajes y conoce gente con buen rollo
                        </p>
                      </div>
                      <div className="max-w-4xl mx-auto">
                        <UsersList
                          users={allUsers}
                          currentUserId={userData.id}
                          onSelectUser={handleSelectUser}
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
            <Footer />
          </div>
        );

      case 'map':
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={isLoggedIn}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              userName={userData?.name}
            />
            <div className="pt-20">
              <Map
                users={allUsers}
                currentUser={userData}
                onMessageUser={handleSelectUser}
                onSendBeer={handleSendBeer}
              />
              <Messaging />
            </div>
            <Footer />
          </div>
        );

      case 'faq':
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={isLoggedIn}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              userName={userData?.name}
            />
            <div className="pt-20">
              <FAQ />
            </div>
            <Footer />
          </div>
        );

      case 'home':
      default:
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={isLoggedIn}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              userName={userData?.name}
            />
            <div className="pt-20">
              {userData && (
                <Dashboard userData={userData} onAddStar={handleAddStar} />
              )}
            </div>
            <Footer />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
          <p className="mt-4 text-[#666666]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderPage()}
      {selectedUser && userData && (
        <ChatWithLimits
          currentUser={userData}
          otherUser={selectedUser}
          onBack={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}

export default App;
