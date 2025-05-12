import { ReactElement, useEffect, useState, useRef } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import useStore from '@/stores/partnerStore';
import type { NextPageWithLayout } from '@/types/page';
import {
    Box,
    Container,
    TextField,
    Button,
    IconButton,
    List,
    ListItem,
    Typography,
    Paper,
    Avatar,
    Stack
  } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import LocationsDropDown from '@/features/partners/LocationsDropDown';
import { WaitIcon } from '@/components/WaitIcon';
import PageHeadline from '@/features/partners/PageHeadline';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';

import { fetchEventConfigurationsByCompany } from '@/services/eventConfigurationService';

interface ChatMessage {
    id: number;
    conversationId: string;
    messageId: string;
    sender: string;
    receiver: string;
    subject: string;
    content: string;
    received: string;
}

interface EventConversation extends EventConfigurationModel {
  newMessage: number;
  formatedTime: string;
}

interface Conversation {
    id: string;
    amount: number;
}

interface AttachmentFileData {
    name: string;
    url: string;
}

const MessagePage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [locationId, setLocationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState<EventConversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<EventConversation | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    //const conversationID = "1744817512889"; // from db
    const sender = "booking@hans-reimer.com"; // from db
    const partnerId = "1";//partnerUser?.companyId;

    // we have to use it later
    let eventConfigurations = [] as EventConfigurationModel[];
    let eventConversations = [] as EventConversation[];


        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, [messages]);
        
          useEffect(() => {

            const fetchConversationList = async () => {

              //const companyId = partnerUser?.companyId;
              if (!partnerId) {
                  //return;
              }
      
              const confs = await fetchEventConfigurationsByCompany(
                  Number.parseInt(partnerId),//partnerId,
                  setIsLoading,
                  setError
              );
      
              if (!confs) {
                  //setEventConfs([]);
                  setError("Error fetching Event Bookings");
                  return;
              }
      
              const sortedConfs = confs.sort((
                  a: EventConfigurationModel,
                  b: EventConfigurationModel
              ) => b.id - a.id);

              eventConfigurations = sortedConfs;



              try {
                const res = await fetch(`http://localhost:3015/v1/partner/messages/getConversations/${partnerId}`);
                if (!res.ok) throw new Error(`Fehler: ${res.status}`);

                const data = await res.json() as Conversation[];

                eventConversations = [];

                // loop events
                for(const event of eventConfigurations)
                {
                  // try to convert event to conversation
                  let eventConversation = event as EventConversation;

                  // now loop all 
                  for (const conversation of data) 
                  {
                    console.log(eventConversation.date);
                    if(eventConversation.date)
                    {
                      const date = new Date(eventConversation.date);
                      const germanDate = new Intl.DateTimeFormat('de-DE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                        }).format(date);
                        eventConversation.formatedTime = germanDate;
                        console.log(eventConversation.formatedTime);
                    }


                    if(conversation.id === event.id.toString())
                    {
                      eventConversation.newMessage = conversation.amount;
                      
                      break;
                    }
                  }
                  eventConversations.push(eventConversation as EventConversation);
                }
        
                // get all requests from db, match the amounts to it.
                console.log(data);
        
                setConversations(eventConversations);
              } catch (err) {
                console.error('Fehler beim Laden der Konversationsliste:', err);
              }
            };
        
            fetchConversationList();
          }, []);

          
        
          const loadConversation = async (conv: EventConversation) => {
            try {
              const res = await fetch(`http://localhost:3015/v1/partner/messages/getConversationForId/${partnerId}/${conv.id}`);
              if (!res.ok) throw new Error(`Fehler: ${res.status}`);
              const data = await res.json() as ChatMessage[];
              setMessages(data);
              setCurrentConversation(conv);
            } catch (err) {
              console.error('Fehler beim Laden der Konversation:', err);
            }
          };
        
          const uploadFile = async (file: File): Promise<string | null> => {
            const formData = new FormData();
            formData.append('file', file);
          
            try {
              const res = await fetch('http://localhost:3021/upload', {
                method: 'POST',
                body: formData,
              });
          
              if (!res.ok) throw new Error('Upload fehlgeschlagen');
          
              const data = await res.json();
              return data.url;
            } catch (error) {
              console.error('Fehler beim Datei-Upload:', error);
              return null;
            }
          };
        
          const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
          
            setSelectedFile(file);
            const url = await uploadFile(file);
            if (url) {
              setUploadedFileUrls((prev) => [...prev, url]);
            }
          };
        
          const handleSend = async () => {
            if (!newMessage || !currentConversation) return;
          
            let lastReceived;
            for (const msg of messages) {
              if (msg.receiver === sender) {
                lastReceived = msg;
              }
            }
          
            if (!lastReceived) {
              lastReceived = {
                sender : currentConversation.booker?.email ?? '',
                subject : "Buchungsanfrage Location " + currentConversation.location?.title,
                messageId : ''
              }

            }
          
            // create form data
            const formData = new FormData();
            formData.append('partnerId', partnerId?.toString() || '');
            formData.append('conversation', currentConversation.id.toString() || '');
            formData.append('sender', sender);
            formData.append('receiver', lastReceived.sender);
            formData.append('subject', lastReceived.subject);
            formData.append('inreplyto', lastReceived.messageId);
            formData.append('content', newMessage);
            formData.append('attachments', JSON.stringify(uploadedFileUrls));
          
            const res = await fetch(`http://localhost:3015/v1/partner/messages/sendMessageForConversation/`, {
              method: 'POST',
              body: formData,
            });
          
            if (res.ok) {
              const responseData = await res.json();
              setMessages((prev) => [...prev, responseData]);
              setNewMessage('');
              setSelectedFile(null);
              setUploadedFileUrls([]); // Clear after send
            } else {
              alert('Fehler beim Senden der Nachricht.');
            }
          };

    return (
        <Box>
            <PageHeadline title='Messages' />
            <Box sx={{
                mt: { xs: 5, md: 10 },
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                ml: 2,
                mb: 5
            }}>
            </Box>
            <Container maxWidth="lg">
      <Box display="flex" height="65vh" mt={4}>
        {/* Linke Spalte: Konversationen */}
        <Box
          width="33%"
          borderRight="1px solid #ccc"
          pr={2}
          sx={{ overflowY: 'auto' }}
        >
          <Typography variant="h6" gutterBottom>
            Konversationen
          </Typography>
          <List>
            {conversations.map(conv => (
              <ListItem
                key={conv.id}
                button
                onClick={() => loadConversation(conv)}
                selected={conv.id === currentConversation?.id}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: conv.id === currentConversation?.id ? '#e6f5fa' : 'transparent',
                }}
              >
                {`Anfrage ${conv.id}: ${conv.location?.title} ${conv.newMessage || ''}`}
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Rechte Spalte: Chat */}
        <Box width="67%" pl={2} display="flex" flexDirection="column">
          <Typography sx={{ fontSize: '18px', textAlign: 'center' }} variant="h4" gutterBottom>
            {currentConversation ? `Anfrage: ${currentConversation.id}` : 'Keine Konversation ausgewählt'}
            {currentConversation ? ` - ${currentConversation.location?.title}` : ''}
          </Typography>
          <Typography sx={{ fontSize: '18px', textAlign: 'center' }} variant="h4" gutterBottom>
            {currentConversation ? `Datum: ${currentConversation.formatedTime}` : ''}
          </Typography>
          <Typography sx={{ fontSize: '18px', textAlign: 'center' }} variant="h4" gutterBottom>
            {currentConversation ? `Personen: ${currentConversation.persons}` : ''}
          </Typography>

          <Paper elevation={3} sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
            <List>
              {messages.map((msg) => {
                const isOwnMessage = msg.sender === sender;
                return (
                  <ListItem key={msg.id} sx={{ display: 'flex', justifyContent: 'center', px: 0 }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1, visibility: isOwnMessage ? 'hidden' : 'visible' }}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ maxWidth: '70%', width: '100%' }}>
                      <Box sx={{ bgcolor: isOwnMessage ? '#edf2f5' : '#e6f5fa', borderRadius: 2, px: 2, py: 1 }}>
                        {(msg as any).fileUrl ? (
                          <Typography variant="body1">
                            {msg.content}<br />
                            <a href={(msg as any).fileUrl} target="_blank" rel="noopener noreferrer">
                              📎 Datei ansehen
                            </a>
                          </Typography>
                        ) : (
                          <Typography variant="body1">{msg.content}</Typography>
                        )}
                      </Box>
                      <Typography variant="caption" display="block" textAlign={isOwnMessage ? 'right' : 'left'} mt={0.5} color="text.secondary">
                        {msg.sender} • {new Date(msg.received).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: 32, height: 32, ml: 1, visibility: !isOwnMessage ? 'hidden' : 'visible' }}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItem>
                );
              })}
              <div ref={messagesEndRef} />
            </List>
          </Paper>

          {currentConversation && (
            <Box mt={2}>
              <TextField
                label="Deine Antwort"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
              <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="contained"
                  sx={{ borderRadius: 0, backgroundColor: '#002a58', '&:hover': { backgroundColor: '#002a58' } }}
                  onClick={handleSend}
                >
                  Antworten
                </Button>
                <IconButton
                  component="label"
                  sx={{ borderRadius: 0, backgroundColor: '#002a58', color: '#fff', '&:hover': { backgroundColor: '#002a58' } }}
                >
                  <AttachFileIcon />
                  <input type="file" hidden onChange={handleFileChange} />
                </IconButton>
              </Box>
              {selectedFile && (
                <Typography variant="body2" mt={1}>
                  Ausgewählte Datei: {selectedFile.name}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
        </Box>   
    );
};

// Use ClientLayout as the layout for this page
MessagePage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default MessagePage;