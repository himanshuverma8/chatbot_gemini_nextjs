'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import toast, { Toaster } from 'react-hot-toast';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  //for automatic scrolling using useRef and useEffect hook
  useEffect(()=>{
    if(bottomRef.current){
      bottomRef.current.scrollIntoView({behavior: "smooth"});
    }
  },[messages])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
        return;
      }

      const name = user.user_metadata?.full_name || user.user_metadata?.name;
      setUser({ email: user.email!, name });

      // Fetch chat history for this user
      const { data: history, error: historyError } = await supabase
        .from('messages')
        .select('query, response')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (historyError) {
        console.error('Error fetching chat history:', historyError);
      } else if (history) {
        const formattedMessages = history.flatMap((msg: any) => [
          { sender: 'user', text: msg.query },
          { sender: 'bot', text: msg.response },
        ]);
        setMessages(formattedMessages);
      }
    };

    getUser();
  }, [router, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout successfully!")
    router.push('/login');
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();

      setPdfText(data.text);
      setUploadedFileName(file.name);

      // Show toast notification with file name
      toast.success(`File "${file.name}" uploaded successfully!`);

      // Add bot message prompting user to ask questions about PDF
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Ask any question related to this PDF.' },
      ]);
    } catch (err) {
      console.error('PDF upload failed:', err);
      toast.error('PDF upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, pdfText }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessage: Message = { sender: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '❌ Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground shadow pr-20">
        <div>
          <h1 className="text-2xl font-semibold">Gemini Chat</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              {user.name && <span className="font-medium">{user.name}</span>} ({user.email})
            </p>
          )}
        </div>
        <Button variant="secondary" className="hover:text-red-500" onClick={logout}>
          Logout
        </Button>
      </header>

      {/* PDF Upload */}
      <div className="px-4 py-2 bg-white border-b flex items-center space-x-4">
        <label className="block text-sm font-medium text-gray-700">Upload PDF:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePDFUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="default"
          className="px-4 py-2"
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </Button>

        {/* Show uploaded file name */}
        {uploadedFileName && (
          <span className="text-sm text-gray-700 italic truncate max-w-xs">
            Uploaded: <strong>{uploadedFileName}</strong>
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-md p-3 rounded-lg whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'ml-auto bg-blue-500 text-white'
                : 'mr-auto bg-white border border-gray-300 text-gray-800'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-md p-3 bg-white border border-gray-300 rounded-lg text-gray-500 italic">
            Typing...
          </div>
        )}
        {/* this is used to perform the automatic scroll using useRef hook */}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="p-4 bg-white border-t flex items-center space-x-2">
      <input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
  placeholder="Ask something..."
  className="flex-1 px-4 py-2 border rounded-md dark:text-black border-black"
/>

        <Button onClick={sendMessage} className="px-4 py-2" variant="default">
          Send
        </Button>
      </footer>
    </div>
  );
}
