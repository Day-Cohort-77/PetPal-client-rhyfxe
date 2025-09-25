'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPets } from '../../services/petService';
import { getUserAppointments } from '../../services/appointmentService';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Grid, Avatar, Tabs } from '@radix-ui/themes';
import Link from 'next/link';
import { FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user's pets and upcoming events
    const fetchDashboardData = async () => {
      try {
        // Fetch pets
        const petsData = await getUserPets();
        setPets(petsData || []);

        // Fetch user appointments
        const appointmentsData = await getUserAppointments();

        // Map appointments to events format
        if (appointmentsData && appointmentsData.length > 0) {
          const appointmentEvents = appointmentsData.map(appointment => ({
            id: appointment.id,
            type: 'VET_VISIT',
            petId: appointment.petId,
            petName: appointment.petName || 'Unknown Pet',
            title: appointment.reason || 'Vet Appointment',
            date: appointment.date,
            time: appointment.time || 'TBD',
            location: appointment.location || 'Not specified',
            status: appointment.status || 'Scheduled',
            veterinarianName: appointment.veterinarianName
          }));

          // Sort by date (closest first)
          appointmentEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

          // Take only upcoming appointments (today or future)
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcomingAppointments = appointmentEvents.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          });

          setUpcomingEvents(upcomingAppointments);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get days until an event
  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Get icon for event type
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'VET_VISIT':
        return <FiCalendar />;
      case 'MEDICATION':
        return <FiClock />;
      case 'VACCINATION':
        return <FiAlertCircle />;
      default:
        return <FiCalendar />;
    }
  };

  const dashboardContent = (
    <>
      <Navbar />
      <Container size="3" py="9">
        <Flex direction="column" gap="6">
          <Heading size="8">Dashboard</Heading>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading dashboard data...</Text>
          ) : (
            <>
              <Tabs.Root defaultValue="overview">
                <Tabs.List>
                  <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                  <Tabs.Trigger value="calendar">Calendar</Tabs.Trigger>
                  <Tabs.Trigger value="alerts">Alerts</Tabs.Trigger>
                </Tabs.List>

                <Box pt="4">
                  <Tabs.Content value="overview">
                    <Grid columns={{ initial: '1', md: '2' }} gap="6">
                      {/* My Pets Section */}
                      <Card>
                        <Flex direction="column" gap="4" p="4">
                          <Flex justify="between" align="center">
                            <Heading size="4">My Pets</Heading>
                            <Button size="2" onClick={() => router.push('/pets/add')}>
                              Add Pet
                            </Button>
                          </Flex>

                          {pets.length === 0 ? (
                            <Text>You don't have any pets yet. Add your first pet to get started.</Text>
                          ) : (
                            <Flex direction="column" gap="3">
                              {pets.map((pet) => (
                                <Link href={`/pets/${pet.id}`} key={pet.id} style={{ textDecoration: 'none' }}>
                                  <Card style={{ cursor: 'pointer' }}>
                                    <Flex align="center" gap="3" p="2">
                                      <Avatar
                                        size="3"
                                        src={pet.imageUrl}
                                        fallback={pet.name.charAt(0)}
                                        radius="full"
                                      />
                                      <Box>
                                        <Text size="3" weight="bold">{pet.name}</Text>
                                        <Text size="1" color="gray">{pet.species} • {pet.breed}</Text>
                                      </Box>
                                    </Flex>
                                  </Card>
                                </Link>
                              ))}
                            </Flex>
                          )}

                          <Flex gap="2">
                            <Button variant="soft" size="2" onClick={() => router.push('/pets')}>
                              View All Pets
                            </Button>
                            <Button variant="soft" size="2" onClick={() => router.push('/pets/medications')}>
                              View Medications
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>

                      {/* Upcoming Events Section */}
                      <Card>
                        <Flex direction="column" gap="4" p="4">
                          <Heading size="4">Upcoming Events</Heading>

                          {upcomingEvents.length === 0 ? (
                            <Text>No upcoming events.</Text>
                          ) : (
                            <Flex direction="column" gap="3">
                              {upcomingEvents.map((event) => (
                                <Card key={event.id}>
                                  <Flex gap="3" p="2">
                                    <Box style={{ color: 'var(--accent-9)', fontSize: '1.5rem' }}>
                                      {getEventIcon(event.type)}
                                    </Box>
                                    <Box style={{ flex: 1 }}>
                                      <Flex justify="between" align="start">
                                        <Box>
                                          <Text size="2" weight="bold">{event.title}</Text>
                                          <Text size="1" color="gray">
                                            {event.petName} • {formatDate(event.date)} • {event.time}
                                          </Text>
                                          {event.location && (
                                            <Text size="1">{event.location}</Text>
                                          )}
                                          {event.veterinarianName && (
                                            <Text size="1">Dr. {event.veterinarianName}</Text>
                                          )}
                                        </Box>
                                        <Flex direction="column" align="end" gap="1">
                                          <Text size="1" color="blue">
                                            {getDaysUntil(event.date)}
                                          </Text>
                                          <Button
                                            size="1"
                                            variant="ghost"
                                            onClick={() => router.push(`/appointments/${event.id}`)}
                                          >
                                            View
                                          </Button>
                                        </Flex>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                </Card>
                              ))}
                            </Flex>
                          )}

                          <Flex gap="2">
                            <Button variant="soft" size="2" onClick={() => router.push('/appointments')}>
                              View All Appointments
                            </Button>
                            <Button variant="soft" size="2" onClick={() => router.push('/calendar')}>
                              View Calendar
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>

                      {/* Quick Actions Section */}
                      <Card>
                        <Flex direction="column" gap="4" p="4">
                          <Heading size="4">Quick Actions</Heading>
                          <Grid columns="2" gap="3">
                            <Button onClick={() => router.push('/pets/add')}>
                              Add New Pet
                            </Button>
                            <Button onClick={() => router.push('/care-providers')}>
                              Manage Care Providers
                            </Button>
                            <Button onClick={() => router.push('/settings')}>
                              Settings
                            </Button>
                            <Button onClick={() => router.push('/export')}>
                              Export Records
                            </Button>
                          </Grid>
                        </Flex>
                      </Card>

                      {/* Recent Activity Section */}
                      <Card>
                        <Flex direction="column" gap="4" p="4">
                          <Heading size="4">Recent Activity</Heading>
                          <Text>No recent activity to display.</Text>
                        </Flex>
                      </Card>
                    </Grid>
                  </Tabs.Content>

                  <Tabs.Content value="calendar">
                    <Card>
                      <Flex direction="column" gap="4" p="4">
                        <Heading size="4">Calendar</Heading>
                        <Text>Calendar view will be implemented here.</Text>
                      </Flex>
                    </Card>
                  </Tabs.Content>

                  <Tabs.Content value="alerts">
                    <Card>
                      <Flex direction="column" gap="4" p="4">
                        <Heading size="4">Alerts</Heading>
                        <Text>You have no active alerts.</Text>
                      </Flex>
                    </Card>
                  </Tabs.Content>
                </Box>
              </Tabs.Root>
            </>
          )}
        </Flex>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="Dashboard">
        {dashboardContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
