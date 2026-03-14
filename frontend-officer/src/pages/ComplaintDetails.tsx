import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    MapPin,
    ExternalLink,
    AlertTriangle,
    Clock,
    Upload,
    Play,
    CheckCircle,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { complaintsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Complaint } from '@/types';

export default function ComplaintDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [workNotes, setWorkNotes] = useState('');
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [workCompleted, setWorkCompleted] = useState(false);

    // Fetch complaint
    const { data, isLoading, error } = useQuery({
        queryKey: ['complaint', id],
        queryFn: () => complaintsApi.getById(Number(id)),
        enabled: !!id,
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ status, resolution }: { status: string; resolution?: string }) =>
            complaintsApi.updateStatus(Number(id), status, resolution),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaint', id] });
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({ queryKey: ['officer-stats'] });
        },
    });

    const complaint = data?.data as Complaint | undefined;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Complaint not found.</p>
                <Button variant="link" onClick={() => navigate('/complaints')}>
                    Back to Complaints
                </Button>
            </div>
        );
    }

    const handleStartWork = async () => {
        try {
            await updateStatusMutation.mutateAsync({ status: 'in_progress' });
            toast.success('Work Started', {
                description: `Complaint #${complaint.id} is now in progress. Timestamp recorded.`,
            });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleMarkResolved = async () => {
        if (!workCompleted) {
            toast.error('Please confirm work completion');
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({
                status: 'resolved',
                resolution: workNotes || 'Issue resolved by officer.'
            });
            toast.success('Marked as Resolved', {
                description: 'Complaint has been resolved successfully.',
            });
            setTimeout(() => navigate('/completed'), 1500);
        } catch (error) {
            toast.error('Failed to mark as resolved');
        }
    };

    const openInMaps = () => {
        if (complaint.latitude && complaint.longitude) {
            window.open(`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-foreground">#{complaint.id}</h1>
                        <PriorityBadge priority={complaint.priority} />
                        <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-muted-foreground">{complaint.category}</p>
                </div>
                <SLATimer createdAt={complaint.createdAt} slaHours={complaint.slaHours} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Complaint Summary */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="section-header">Complaint Details</h2>
                        <p className="text-foreground leading-relaxed">{complaint.text}</p>

                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Filed: {new Date(complaint.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Citizen: {complaint.citizenName} • {complaint.citizenPhone}</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="section-header">Location</h2>
                        <div className="flex items-start gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-foreground">{complaint.district?.name || 'Unknown District'}</p>
                                <p className="text-sm text-muted-foreground">
                                    District ID: {complaint.districtId}
                                </p>
                            </div>
                        </div>

                        {(complaint.latitude && complaint.longitude) && (
                            <>
                                <div className="bg-muted rounded-lg h-32 flex items-center justify-center mb-4">
                                    <div className="text-center text-muted-foreground">
                                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">{complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</p>
                                    </div>
                                </div>

                                <Button onClick={openInMaps} variant="outline" className="w-full">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open in Google Maps
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Media */}
                    {(complaint.imagePath || complaint.audioPath || complaint.voiceTranscript) && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="section-header">Citizen Uploaded Media</h2>

                            {complaint.imagePath && (
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}

                            {complaint.voiceTranscript && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Voice Transcript:</p>
                                    <p className="text-foreground">{complaint.voiceTranscript}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Work Actions */}
                    {(complaint.status === 'acknowledged' || complaint.status === 'submitted') && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="section-header">Start Work</h2>
                            <p className="text-muted-foreground mb-4">
                                Click the button below to start working on this complaint. A timestamp will be recorded.
                            </p>
                            <Button
                                onClick={handleStartWork}
                                className="action-button"
                                size="lg"
                                disabled={updateStatusMutation.isPending}
                            >
                                {updateStatusMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Play className="w-5 h-5" />
                                )}
                                Start Work
                            </Button>
                        </div>
                    )}

                    {complaint.status === 'in_progress' && (
                        <>
                            {/* Upload Proof */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="section-header">Upload Proof of Work</h2>

                                <div>
                                    <Label className="mb-2 block">After Image (Recommended)</Label>
                                    <label className="upload-zone block border-primary/50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setAfterImage(e.target.files?.[0] || null)}
                                        />
                                        {afterImage ? (
                                            <div className="text-success">
                                                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm">{afterImage.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                                                <p className="text-sm text-primary">Click to upload</p>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="notes" className="mb-2 block">Work Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Describe the work completed..."
                                        value={workNotes}
                                        onChange={(e) => setWorkNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    GPS location will be auto-tagged with your submission
                                </p>
                            </div>

                            {/* Mark Resolved */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="section-header">Mark as Resolved</h2>

                                <div className="flex items-start gap-3 mb-4">
                                    <Checkbox
                                        id="completed"
                                        checked={workCompleted}
                                        onCheckedChange={(checked) => setWorkCompleted(checked as boolean)}
                                    />
                                    <Label htmlFor="completed" className="text-foreground cursor-pointer">
                                        I confirm that the work has been completed as per the complaint requirements.
                                    </Label>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4">
                                    Note: Final closure requires citizen confirmation.
                                </p>

                                <Button
                                    onClick={handleMarkResolved}
                                    disabled={!workCompleted || updateStatusMutation.isPending}
                                    className="action-button-success"
                                    size="lg"
                                >
                                    {updateStatusMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    Mark as Resolved
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* ML Insights */}
                    {complaint.mlResults && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="section-header flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                                AI Insights
                            </h2>

                            <div className="space-y-4">
                                {complaint.mlResults.classification && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Classification Confidence</p>
                                        <p className="text-sm text-foreground">
                                            {(complaint.mlResults.classification.confidence * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                )}

                                {complaint.mlResults.image?.description && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Image Analysis</p>
                                        <p className="text-sm text-foreground">{complaint.mlResults.image.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="section-header">Quick Info</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm text-muted-foreground">Category</dt>
                                <dd className="font-medium text-foreground">{complaint.category}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">District</dt>
                                <dd className="font-medium text-foreground">{complaint.district?.name || 'Unknown'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">SLA Hours</dt>
                                <dd className="font-medium text-foreground">{complaint.slaHours} hours</dd>
                            </div>
                            {complaint.assignedAt && (
                                <div>
                                    <dt className="text-sm text-muted-foreground">Assigned At</dt>
                                    <dd className="font-medium text-foreground">
                                        {new Date(complaint.assignedAt).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
