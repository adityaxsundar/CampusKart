import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Camera, Image as ImageIcon, Mic, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom natively when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Load message history from DB
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/messages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(data.data);
      } catch (err) {
        console.error('History failed:', err);
      }
    };
    loadHistory();

    // Connect socket safely
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join global default room securely
    newSocket.emit('join_room', 'global_chat');

    newSocket.on('receive_message', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() === '' || !socket) return;

    const finalPayload = {
      roomId: 'global_chat',
      senderId: user._id,
      text: inputText,
      isAudio: false
    };

    socket.emit('send_message', finalPayload);
    setInputText('');
  };

  if (!user) return <div className="text-center mt-20 text-white font-bold text-xl">Please Login to Access Live Chat.</div>;

  return (
    <div className="flex justify-center items-center w-full min-h-[85vh]">
      {/* Container simulating a mobile device or iMessage window */}
      <div className="w-full max-w-md bg-white sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[800px] border-[8px] border-gray-900 relative">
        
        {/* Top iOS styled Navbar */}
        <div className="bg-[#f6f6f6] border-b border-gray-300 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <Link to="/" className="text-blue-500 hover:opacity-70 transition flex items-center">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gradient-to-tr from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-1 shadow-sm">
              CC
            </div>
            <span className="text-black font-semibold text-xs text-center">Campus Chatroom</span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {user.name}</span>
          </div>
          <div className="w-6"></div> {/* Spacer to center title natively */}
        </div>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white custom-scrollbar">
          {messages.map((msg, index) => {
            const isMe = msg.sender?._id === user._id;

            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-fade-in`}>
                {!isMe && (
                  <span className="text-[10px] text-gray-400 ml-1 mb-1">{msg.sender?.name || 'Unknown'}</span>
                )}
                <div 
                  className={`
                    px-4 py-2.5 rounded-2xl max-w-[80%] text-[15px] shadow-sm
                    ${isMe 
                      ? 'bg-[#34c759] text-white rounded-tr-sm' // Native iOS Green Bubble
                      : 'bg-[#e9e9eb] text-black rounded-tl-sm' // Native iOS Gray Bubble
                    }
                  `}
                  style={{ wordBreak: 'break-word' }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom iMessage Input Bar */}
        <div className="bg-[#f6f6f6] border-t border-gray-300 px-3 py-3 w-full">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <button type="button" className="text-gray-500 hover:text-gray-700 transition">
               <Camera size={26} strokeWidth={1.5} />
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700 transition">
               <ImageIcon size={26} strokeWidth={1.5} />
            </button>
            
            <div className="flex-1 relative flex items-center">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="iMessage"
                className="w-full bg-white border border-gray-300 text-black px-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
              />
              <button 
                type={inputText.trim() ? "submit" : "button"}
                className={`absolute right-2 p-1.5 rounded-full text-white transition-all transform ${inputText.trim() ? 'bg-blue-500 rotate-0 scale-100' : 'bg-[#34c759] scale-100 hover:scale-105'}`}
              >
                {inputText.trim() ? (
                   // Simple submit arrow if text exists
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                ) : (
                   // Mic icon if completely empty exactly matching requested image
                   <Mic size={16} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Chat;
