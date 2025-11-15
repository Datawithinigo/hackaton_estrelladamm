import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import Messaging from './components/Messaging';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Profile from './components/Profile';
import UsersList from './components/UsersList';
import Chat from './components/Chat';
import Conversations from './components/Conversations';
import { User, Message, getAllUsers, getConversation, sendMessage, createUser, updateUser, getUserById } from './lib/supabase';

type Page = 'home' | 'profile' | 'stars' | 'map' | 'faq' | 'messages';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<(User & { id: string }) | null>(null);
  const [allUsers, setAllUsers] = useState<(User & { id: string })[]>([]);
  const [selectedUser, setSelectedUser] = useState<(User & { id: string }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId) {
        try {
          const user = await getUserById(savedUserId);
          if (user && user.id) {
            setUserData(user as User & { id: string });
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('currentUserId');
        }
      }
      setIsLoading(false);
    };

    loadUser();
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

  const handleRegistration = async (data: { name: string; age: number; gender: string }) => {
    try {
      const newUser = await createUser({
        name: data.name,
        age: data.age,
        gender: data.gender,
        stars: 0,
        level: 'Bronce',
        visible_on_map: false
      });

      if (newUser && newUser.id) {
        setUserData(newUser as User & { id: string });
        setIsLoggedIn(true);
        localStorage.setItem('currentUserId', newUser.id);
        setCurrentPage('profile');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear el usuario. Por favor, intenta de nuevo.');
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

  const renderPage = () => {
    switch (currentPage) {
      case 'messages':
        return (
          <div className="min-h-screen bg-white">
            <Header isLoggedIn={isLoggedIn} currentPage={currentPage} onNavigate={setCurrentPage} />
            {userData && (
              <Conversations
                currentUser={userData}
                users={allUsers}
                messages={allMessages}
                onSelectUser={handleSelectUser}
              />
            )}
            <Footer />
          </div>
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-white">
            <Header isLoggedIn={isLoggedIn} currentPage={currentPage} onNavigate={setCurrentPage} />
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
            <Header isLoggedIn={isLoggedIn} currentPage={currentPage} onNavigate={setCurrentPage} />
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
            <Header isLoggedIn={isLoggedIn} currentPage={currentPage} onNavigate={setCurrentPage} />
            <div className="pt-20">
              <Map />
              <Messaging />
            </div>
            <Footer />
          </div>
        );

      case 'faq':
        return (
          <div className="min-h-screen bg-white">
            <Header isLoggedIn={isLoggedIn} currentPage={currentPage} onNavigate={setCurrentPage} />
            <div className="pt-20">
              <FAQ />
            </div>
            <Footer />
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-white">
            <Header isLoggedIn={isLoggedIn} currentPage={currentPage} onNavigate={setCurrentPage} />
            <Hero />
            <HowItWorks />
            <Registration onRegister={handleRegistration} isLoggedIn={isLoggedIn} />
            {isLoggedIn && userData && (
              <Dashboard userData={userData} onAddStar={handleAddStar} />
            )}
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
        <Chat
          currentUser={userData}
          otherUser={selectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}

export default App;
