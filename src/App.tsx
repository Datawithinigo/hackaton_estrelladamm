import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Map from './components/Map';
import ChatFeatures from './components/ChatFeatures';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ProfileAndStars from './components/ProfileAndStars';
import UsersList from './components/UsersList';
import ChatWithLimits from './components/ChatWithLimits';
import ConversationsWithLimits from './components/ConversationsWithLimits';
import FilterStatus from './components/FilterStatus';
import { User, Message, getAllUsers, getConversation, sendMessage, createUser, updateUser, getUserByAuthId, signInWithGoogle, authenticateWithEmail, signOut, getCurrentAuthUser, supabase } from './lib/supabase';
import { uploadProfilePhoto, deleteProfilePhoto } from './lib/imageUpload';
import { FilterProvider } from './contexts/FilterContext';
import { useNearbyUsers } from './hooks/useNearbyUsers';

type Page = 'home' | 'stars' | 'map' | 'faq' | 'messages' | 'auth' | 'onboarding';

// Componente interno que usa el hook useNearbyUsers
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<(User & { id: string }) | null>(null);
  const [pendingAuthEmail, setPendingAuthEmail] = useState<string>('');
  const [allUsers, setAllUsers] = useState<(User & { id: string })[]>([]);
  const [selectedUser, setSelectedUser] = useState<(User & { id: string }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Hook para contar usuarios cercanos basados en filtros
  const nearbyUsersCount = useNearbyUsers(allUsers, userData?.id);

  useEffect(() => {
    console.log('🎯 App starting - skipping auth check for now');
    // Set a very short timeout and skip auth for debugging
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPage('home');
    }, 100);
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
      console.log('🔐 Starting authentication for:', email);
      const result = await authenticateWithEmail(email, password);
      console.log('🔐 Authentication result:', result);

      if (result.type === 'signup' && result.needsOnboarding) {
        console.log('🔐 New user needs onboarding');
        setPendingAuthEmail(email);
        setCurrentPage('onboarding');
        return;
      } 
      
      if (result.type === 'signin') {
        console.log('🔐 User signed in, checking profile...');
        try {
          const user = await getUserByAuthId(result.user.id);
          console.log('🔐 User from DB:', user);
          
          if (user && user.id) {
            if (!user.name || !user.age || !user.gender) {
              console.log('🔐 Existing user needs onboarding');
              setPendingAuthEmail(email);
              setCurrentPage('onboarding');
            } else {
              console.log('🔐 User complete, setting as logged in');
              setUserData(user as User & { id: string });
              setIsLoggedIn(true);
              localStorage.setItem('currentUserId', user.id);
              setCurrentPage('stars');
            }
          } else {
            console.log('🔐 No user found in DB, creating record and needs onboarding');
            // Create user record for existing auth user
            try {
              await createUser({
                auth_user_id: result.user.id,
                email: result.user.email || email,
                stars: 0,
                level: 'Bronce',
                visible_on_map: true
              });
            } catch (createError) {
              console.warn('🔐 User creation warning:', createError);
            }
            setPendingAuthEmail(email);
            setCurrentPage('onboarding');
          }
        } catch (dbError) {
          console.error('🔐 Database error:', dbError);
          // If DB error, still allow onboarding
          setPendingAuthEmail(email);
          setCurrentPage('onboarding');
        }
      }
    } catch (error: any) {
      console.error('❌ Error during authentication:', error);
      
      // More specific error messages
      let errorMessage = 'Error al autenticar. Verifica tus credenciales e intenta de nuevo.';
      
      if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirma tu email antes de iniciar sesión.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (error.message?.includes('Unable to validate email address')) {
        errorMessage = 'Email inválido. Verifica que sea una dirección de email válida.';
      }
      
      alert(errorMessage);
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
    const currentStars = userData.stars || 0;
    const newStars = currentStars + 1;
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

    try {
      console.log('📸 Starting photo upload for user:', userData.id);
      
      // Convert to base64 (compression is handled inside uploadProfilePhoto)
      const base64DataUrl = await uploadProfilePhoto(file);
      console.log('📸 Image converted to base64');
      
      // Clear old photo reference (no actual deletion needed for base64)
      if (userData.profile_photo_url) {
        console.log('📸 Clearing old profile photo reference...');
        await deleteProfilePhoto(userData.profile_photo_url);
      }
      
      // Update user record in database with base64 data
      console.log('📸 Updating user record with new photo data...');
      const updatedUser = await updateUser(userData.id, { profile_photo_url: base64DataUrl });
      
      if (updatedUser) {
        setUserData(updatedUser as User & { id: string });
        console.log('✅ Photo uploaded and user record updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating photo:', error);
      // TODO: Show user-friendly error message
      alert(error instanceof Error ? error.message : 'Error al subir la foto');
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
    if (!userData || !userData.id) {
      console.error('❌ No user data available for beer sending');
      alert('Error: No hay datos de usuario. Inicia sesión de nuevo.');
      return;
    }

    if (!recipientId) {
      console.error('❌ No recipient ID provided');
      alert('Error: Usuario destinatario no válido.');
      return;
    }

    console.log('🍺 Sending beer from', userData.id, 'to', recipientId);

    try {
      // Validate that we're not sending to ourselves
      if (userData.id === recipientId) {
        alert('No puedes enviarte una cerveza a ti mismo 😅');
        return;
      }

      // Check if recipient exists
      const { data: recipient, error: recipientError } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', recipientId)
        .single();

      if (recipientError) {
        console.error('❌ Recipient not found:', recipientError);
        alert('Error: Usuario destinatario no encontrado.');
        return;
      }

      console.log('🍺 Sending beer to:', recipient.name);

      // Find or create conversation with the recipient
      let conversation: { id: string } | null;
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${userData.id},user2_id.eq.${recipientId}),and(user1_id.eq.${recipientId},user2_id.eq.${userData.id})`)
        .single();

      if (convError && convError.code === 'PGRST116') {
        // Conversation doesn't exist, create it
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user1_id: userData.id,
            user2_id: recipientId
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error('Error al crear conversación: ' + createError.message);
        }
        conversation = newConversation;
      } else if (convError) {
        throw new Error('Error al buscar conversación: ' + convError.message);
      } else {
        conversation = convData;
      }

      if (!conversation) {
        throw new Error('Error: No se pudo establecer la conversación');
      }

      // Send beer message with special styling
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: userData.id,
          recipient_id: recipientId,
          conversation_id: conversation.id,
          content: `🍺 ¡${userData.name} te ha invitado a una cerveza! 🍺`
        });

      if (messageError) {
        throw new Error('Error al enviar mensaje de cerveza: ' + messageError.message);
      }

      console.log('✅ Beer message sent successfully');

      // Add bonus messages for sending a beer using the proper function
      try {
        const { data: bonusResult, error: bonusError } = await supabase.rpc('add_beer_bonus_messages', {
          p_user_id: userData.id,
          p_bonus_amount: 10
        });

        if (bonusError) {
          console.error('⚠️ Error adding beer bonus messages:', bonusError);
          // Don't fail the whole operation for this
        } else {
          console.log('✅ Bonus messages added successfully:', bonusResult);
        }
      } catch (bonusErr) {
        console.warn('⚠️ Bonus message logic failed (non-critical):', bonusErr);
      }

      alert('🍺 ¡Cerveza enviada! Has recibido 10 mensajes adicionales por tu generosidad.');
    } catch (error) {
      console.error('❌ Error sending beer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert('Error al enviar la cerveza: ' + errorMessage);
    }
  };

  const handleSendBeerFromProfile = async () => {
    if (!userData || !allUsers.length) {
      alert('No hay usuarios disponibles para enviar cerveza.');
      return;
    }

    // Filtrar usuarios (excluir al usuario actual)
    const availableUsers = allUsers.filter(user => user.id !== userData.id);
    
    if (availableUsers.length === 0) {
      alert('No hay otros usuarios disponibles para enviar cerveza.');
      return;
    }

    // Mostrar los primeros usuarios disponibles
    const userOptions = availableUsers.slice(0, 5).map((user, index) => 
      `${index + 1}. ${user.name || 'Usuario sin nombre'}`
    ).join('\n');

    const selection = prompt(`🍺 ¿A quién quieres invitar una cerveza?\n\n${userOptions}\n\nEscribe el número (1-${Math.min(5, availableUsers.length)}):`);
    
    if (selection) {
      const userIndex = parseInt(selection) - 1;
      if (userIndex >= 0 && userIndex < Math.min(5, availableUsers.length)) {
        const selectedUser = availableUsers[userIndex];
        await handleSendBeer(selectedUser.id);
      } else {
        alert('Selección no válida.');
      }
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
                <Hero nearbyUsersCount={nearbyUsersCount} />
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
                      Encuentra tu Estrella!
                    </button>
                  </div>
                </section>
                <ChatFeatures />
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
                  <ProfileAndStars 
                    userData={userData} 
                    nearbyUsersCount={nearbyUsersCount}
                    onAddStar={handleAddStar}
                    onPhotoUpload={handlePhotoUpload}
                    onBioUpdate={handleBioUpdate}
                    onSendBeer={handleSendBeerFromProfile}
                  />
                      <section id="usuarios" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                      <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
                          Conecta con otras Estrellas
                        </h2>
                        <p className="text-xl text-[#666666]">
                          Envía mensajes y conoce gente con buen rollo
                        </p>
                      </div>
                      <div className="max-w-4xl mx-auto">
                        <FilterStatus className="justify-center" />
                        <UsersList
                          users={allUsers}
                          currentUserId={userData.id}
                          onSelectUser={handleSelectUser}
                          onSendBeer={handleSendBeer}
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
                <ProfileAndStars 
                  userData={userData} 
                  nearbyUsersCount={nearbyUsersCount}
                  onAddStar={handleAddStar}
                  onPhotoUpload={handlePhotoUpload}
                  onBioUpdate={handleBioUpdate}
                  onSendBeer={handleSendBeerFromProfile}
                />
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

// Función App principal con FilterProvider
function App() {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
}

export default App;
