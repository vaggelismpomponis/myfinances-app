import React from 'react';
const DesktopLayout = React.lazy(() => import('./DesktopLayout'));
const MobileLayout = React.lazy(() => import('./MobileLayout'));
import { useSubscription } from '../contexts/SubscriptionContext';

const StatsView = React.lazy(() => import('../views/StatsView'));
const HistoryView = React.lazy(() => import('../views/HistoryView'));
const GoalsView = React.lazy(() => import('../views/GoalsView'));
const BudgetsView = React.lazy(() => import('../views/BudgetsView'));
const BackupView = React.lazy(() => import('../views/BackupView'));
const FeedbackView = React.lazy(() => import('../views/FeedbackView'));
const AdminView = React.lazy(() => import('../views/AdminView'));
const PrivacyPolicyView = React.lazy(() => import('../views/PrivacyPolicyView'));
const UpgradePage  = React.lazy(() => import('../views/UpgradePage'));
const FinancialAdvisorView = React.lazy(() => import('../views/FinancialAdvisorView'));
const GuideView = React.lazy(() => import('../views/GuideView'));
const AccountSettingsView = React.lazy(() => import('../views/AccountSettingsView'));
const GeneralSettingsView = React.lazy(() => import('../views/GeneralSettingsView'));
const SecuritySettingsView = React.lazy(() => import('../views/SecuritySettingsView'));
const ProfileView = React.lazy(() => import('../views/ProfileView'));
const RecurringView = React.lazy(() => import('../views/RecurringView'));
import HomeView from '../views/HomeView';

const ProtectedAdvisorView = ({ transactions, goals, onBack, hideHeader }) => {
    const { isPro } = useSubscription();
    return isPro ? <FinancialAdvisorView transactions={transactions} goals={goals} onBack={onBack} hideHeader={hideHeader} /> : null;
};

const ProtectedRecurringView = ({ user, onBack, hideHeader }) => {
    const { isPro } = useSubscription();
    return isPro ? <RecurringView user={user} onBack={onBack} hideHeader={hideHeader} /> : null;
};

const ProtectedStatsView = ({ transactions }) => {
    const { isPro } = useSubscription();
    return isPro ? <StatsView transactions={transactions} /> : null;
};

export default function AppRouter(props) {
    const { 
        isDesktop, activeTab, setActiveTab, previousTab, setPreviousTab,
        user, transactions, budgets, goals, balance, totalIncome, totalExpense,
        deleteTransaction, handleEdit, handleSignOut, openAddModal, handleStartTour,
        ...rest
    } = props;

    // Desktop: Renders everything in the main view pane
    if (isDesktop) {
        return (
            <DesktopLayout 
                activeTab={activeTab} setActiveTab={setActiveTab} setPreviousTab={setPreviousTab}
                user={user} transactions={transactions} budgets={budgets} 
                balance={balance} totalIncome={totalIncome} totalExpense={totalExpense}
                onSignOut={handleSignOut} onAdd={openAddModal}
                {...rest}
            >
                <React.Suspense fallback={<div className="h-full w-full" />}>
                    {activeTab === 'home' && (
                        <HomeView
                            balance={balance} totalIncome={totalIncome} totalExpense={totalExpense}
                            transactions={transactions} budgets={budgets}
                            onDelete={deleteTransaction} onEdit={handleEdit}
                            setActiveTab={setActiveTab}
                            onRecurring={() => { setPreviousTab('home'); setActiveTab('recurring'); }}
                            isDesktop={isDesktop}
                            user={user}
                        />
                    )}
                    {activeTab === 'stats' && <ProtectedStatsView transactions={transactions} />}
                    {activeTab === 'history' && <HistoryView transactions={transactions} onDelete={deleteTransaction} onEdit={handleEdit} />}
                    {activeTab === 'profile' && (
                        <ProfileView user={user} onBack={() => setActiveTab('home')} onSignOut={handleSignOut} hideHeader={true}
                            onRecurring={() => { setPreviousTab('profile'); setActiveTab('recurring'); }}
                            onAccount={() => setActiveTab('account')}
                            onGeneral={() => setActiveTab('general')}
                            onSecurity={() => setActiveTab('security')}
                            onBackup={() => setActiveTab('backup')}
                            onAdmin={() => setActiveTab('admin')}
                            onFeedback={() => setActiveTab('feedback')}
                            onGuide={() => setActiveTab('guide')}
                        />
                    )}
                    {activeTab === 'guide' && (
                        <GuideView 
                            onBack={() => setActiveTab('profile')} hideHeader={true} onStartTour={handleStartTour}
                            onNavigate={(tab) => { if (tab === 'add') openAddModal(); else setActiveTab(tab); }}
                        />
                    )}
                    {activeTab === 'recurring' && <ProtectedRecurringView user={user} onBack={() => setActiveTab(previousTab)} hideHeader={true} />}
                    {activeTab === 'account' && <AccountSettingsView user={user} onBack={() => setActiveTab('profile')} hideHeader={true} />}
                    {activeTab === 'general' && <GeneralSettingsView user={user} onBack={() => setActiveTab('profile')} onPrivacy={() => setActiveTab('privacy')} hideHeader={true} />}
                    {activeTab === 'privacy' && <PrivacyPolicyView onBack={() => setActiveTab('general')} hideHeader={true} />}
                    {activeTab === 'feedback' && <FeedbackView user={user} onBack={() => setActiveTab('profile')} hideHeader={true} />}
                    {activeTab === 'security' && <SecuritySettingsView user={user} onBack={() => setActiveTab('profile')} hideHeader={true} />}
                    {activeTab === 'backup' && <BackupView user={user} onBack={() => setActiveTab('profile')} hideHeader={true} />}
                    {activeTab === 'admin' && user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' && <AdminView onBack={() => setActiveTab('profile')} hideHeader={true} />}
                    {activeTab === 'upgrade' && <UpgradePage onBack={() => setActiveTab(previousTab || 'home')} />}
                    {activeTab === 'goals' && <GoalsView user={user} onBack={() => setActiveTab('home')} />}
                    {activeTab === 'budgets' && <BudgetsView user={user} transactions={transactions} onBack={() => setActiveTab('home')} />}
                    {activeTab === 'advisor' && <ProtectedAdvisorView transactions={transactions} goals={goals} onBack={() => setActiveTab('home')} />}
                </React.Suspense>
            </DesktopLayout>
        );
    }

    // Mobile: Splits the views into Main Area (children) and Fullscreen Overlays
    return (
        <React.Suspense fallback={<div className="h-full w-full" />}>
            <MobileLayout 
                activeTab={activeTab} setActiveTab={setActiveTab} openAddModal={openAddModal}
                {...rest}
                overlays={
                    <React.Suspense fallback={<div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark" />}>
                        {activeTab === 'profile' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <ProfileView user={user} onBack={() => setActiveTab('home')} onSignOut={handleSignOut}
                                    onRecurring={() => { setPreviousTab('profile'); setActiveTab('recurring'); }}
                                    onAccount={() => setActiveTab('account')}
                                    onGeneral={() => setActiveTab('general')}
                                    onSecurity={() => setActiveTab('security')}
                                    onBackup={() => setActiveTab('backup')}
                                    onAdmin={() => setActiveTab('admin')}
                                    onFeedback={() => setActiveTab('feedback')}
                                    onGuide={() => setActiveTab('guide')}
                                />
                            </div>
                        )}
                        {activeTab === 'guide' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <GuideView 
                                    onBack={() => setActiveTab('profile')} onStartTour={handleStartTour}
                                    onNavigate={(tab) => { if (tab === 'add') openAddModal(); else setActiveTab(tab); }}
                                />
                            </div>
                        )}
                        {activeTab === 'recurring' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <ProtectedRecurringView user={user} onBack={() => setActiveTab(previousTab)} />
                            </div>
                        )}
                        {activeTab === 'account' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <AccountSettingsView user={user} onBack={() => setActiveTab('profile')} />
                            </div>
                        )}
                        {activeTab === 'general' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <GeneralSettingsView user={user} onBack={() => setActiveTab('profile')} onPrivacy={() => setActiveTab('privacy')} />
                            </div>
                        )}
                        {activeTab === 'privacy' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <PrivacyPolicyView onBack={() => setActiveTab('general')} />
                            </div>
                        )}
                        {activeTab === 'feedback' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <FeedbackView user={user} onBack={() => setActiveTab('profile')} />
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <SecuritySettingsView user={user} onBack={() => setActiveTab('profile')} />
                            </div>
                        )}
                        {activeTab === 'backup' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <BackupView user={user} onBack={() => setActiveTab('profile')} />
                            </div>
                        )}
                        {activeTab === 'admin' && user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                                <AdminView onBack={() => setActiveTab('profile')} />
                            </div>
                        )}
                        {activeTab === 'upgrade' && (
                            <div className="absolute inset-0 z-[60] bg-gray-50 dark:bg-surface-dark">
                                <UpgradePage onBack={() => setActiveTab(previousTab === 'upgrade' ? 'home' : (previousTab || 'home'))} />
                            </div>
                        )}
                        {activeTab === 'goals' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark flex flex-col">
                                <GoalsView user={user} onBack={() => setActiveTab('home')} />
                            </div>
                        )}
                        {activeTab === 'budgets' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark flex flex-col">
                                <BudgetsView user={user} transactions={transactions} onBack={() => setActiveTab('home')} />
                            </div>
                        )}
                        {activeTab === 'advisor' && (
                            <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark flex flex-col">
                                <ProtectedAdvisorView transactions={transactions} goals={goals} onBack={() => setActiveTab('home')} />
                            </div>
                        )}
                    </React.Suspense>
                }
            >
                <React.Suspense fallback={<div className="h-full w-full" />}>
                    {activeTab === 'home' && (
                        <HomeView
                            balance={balance} totalIncome={totalIncome} totalExpense={totalExpense}
                            transactions={transactions} budgets={budgets}
                            onDelete={deleteTransaction} onEdit={handleEdit}
                            setActiveTab={setActiveTab}
                            onRecurring={() => { setPreviousTab('home'); setActiveTab('recurring'); }}
                        />
                    )}
                    {activeTab === 'stats' && <ProtectedStatsView transactions={transactions} />}
                    {activeTab === 'history' && <HistoryView transactions={transactions} onDelete={deleteTransaction} onEdit={handleEdit} />}
                </React.Suspense>
            </MobileLayout>
        </React.Suspense>
    );
}
