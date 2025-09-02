// src/components/BatchInfo.jsx
// Component for displaying batch information in course cards and details
import React from 'react';
import {
    getCurrentBatch,
    getNextAvailableBatch,
    formatBatchDateRange,
    getBatchStatusText,
    isBatchNearlyFull,
    isBatchFull,
    getBatchAvailableSeats
} from '../data/coursesData';

const BatchInfo = ({ course, enrollmentCount = 0, showDetailed = false, selectedBatch = null }) => {
    if (!course.batches || course.batches.length === 0) {
        return (
            <div className="batch-info">
                <div className="batch-status legacy">
                    <span className="batch-label">Legacy Course</span>
                    <span className="batch-date">Enrollment open</span>
                </div>
            </div>
        );
    }

    const currentBatch = getCurrentBatch(course);
    const nextAvailableBatch = getNextAvailableBatch(course);
    const displayBatch = selectedBatch ?
        course.batches.find(b => b.batchNumber === selectedBatch) :
        (nextAvailableBatch || currentBatch);

    if (!displayBatch) {
        return (
            <div className="batch-info">
                <div className="batch-status unavailable">
                    <span className="batch-label">No Available Batches</span>
                    <span className="batch-date">Check back later</span>
                </div>
            </div>
        );
    }

    const batchEnrollmentCount = displayBatch.enrollmentCount || enrollmentCount;
    const isNearlyFull = isBatchNearlyFull({ ...displayBatch, enrollmentCount: batchEnrollmentCount });
    const isFull = isBatchFull({ ...displayBatch, enrollmentCount: batchEnrollmentCount });
    const availableSeats = getBatchAvailableSeats({ ...displayBatch, enrollmentCount: batchEnrollmentCount });

    if (showDetailed) {
        return (
            <div className="batch-info detailed">
                <div className="batch-header">
                    <h4>Batch Information</h4>
                </div>

                {course.batches.map(batch => {
                    const batchCount = batch.enrollmentCount || 0;
                    const batchIsNearlyFull = isBatchNearlyFull({ ...batch, enrollmentCount: batchCount });
                    const batchIsFull = isBatchFull({ ...batch, enrollmentCount: batchCount });
                    const batchAvailableSeats = getBatchAvailableSeats({ ...batch, enrollmentCount: batchCount });

                    return (
                        <div key={batch.batchNumber} className={`batch-detail ${batch.status}`}>
                            <div className="batch-summary">
                                <div className="batch-title">
                                    <span className={`batch-number batch-${batch.batchNumber}`}>
                                        Batch {batch.batchNumber}
                                    </span>
                                    <span className={`batch-status-text ${batch.status}`}>
                                        {getBatchStatusText(batch)}
                                    </span>
                                </div>

                                <div className="batch-dates">
                                    <span className="date-range">
                                        {formatBatchDateRange(batch)}
                                    </span>
                                </div>

                                <div className="batch-capacity">
                                    <div className="capacity-bar">
                                        <div
                                            className={`capacity-fill ${batchIsFull ? 'full' : batchIsNearlyFull ? 'nearly-full' : ''}`}
                                            style={{ width: `${(batchCount / batch.maxCapacity) * 100}%` }}
                                        />
                                    </div>
                                    <span className="capacity-text">
                                        {batchCount} / {batch.maxCapacity} enrolled
                                        {!batchIsFull && ` (${batchAvailableSeats} seats available)`}
                                    </span>
                                </div>

                                {batch.classLinks && (
                                    <div className="class-links">
                                        <h5>Class Links:</h5>
                                        <div className="links-grid">
                                            {batch.classLinks.zoom && (
                                                <a href={batch.classLinks.zoom} className="class-link zoom" target="_blank" rel="noopener noreferrer">
                                                    📹 Zoom
                                                </a>
                                            )}
                                            {batch.classLinks.discord && (
                                                <a href={batch.classLinks.discord} className="class-link discord" target="_blank" rel="noopener noreferrer">
                                                    💬 Discord
                                                </a>
                                            )}
                                            {batch.classLinks.materials && (
                                                <a href={batch.classLinks.materials} className="class-link materials" target="_blank" rel="noopener noreferrer">
                                                    📚 Materials
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="batch-info">
            <div className={`batch-status ${displayBatch.status} ${isFull ? 'full' : isNearlyFull ? 'nearly-full' : ''}`}>
                <div className="batch-main">
                    <span className={`batch-number batch-${displayBatch.batchNumber}`}>
                        Batch {displayBatch.batchNumber}
                    </span>
                    <span className={`batch-status-text ${displayBatch.status}`}>
                        {getBatchStatusText(displayBatch)}
                    </span>
                </div>

                <div className="batch-details">
                    <span className="batch-date">
                        {formatBatchDateRange(displayBatch)}
                    </span>

                    <div className="batch-enrollment">
                        <span className={`enrollment-count ${isFull ? 'full' : isNearlyFull ? 'nearly-full' : ''}`}>
                            {batchEnrollmentCount} / {displayBatch.maxCapacity} enrolled
                        </span>
                        {isFull && <span className="full-badge">FULL</span>}
                        {isNearlyFull && !isFull && <span className="nearly-full-badge">FILLING FAST</span>}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .batch-info {
                    margin: 10px 0;
                }

                .batch-status {
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    background-color: #f8f9fa;
                }

                .batch-status.upcoming {
                    background-color: #e3f2fd;
                    border-color: #90caf9;
                }

                .batch-status.active {
                    background-color: #e8f5e8;
                    border-color: #a5d6a7;
                }

                .batch-status.completed {
                    background-color: #fafafa;
                    border-color: #e0e0e0;
                    opacity: 0.7;
                }

                .batch-status.unavailable {
                    background-color: #ffebee;
                    border-color: #ffcdd2;
                }

                .batch-status.nearly-full {
                    background-color: #fff3e0;
                    border-color: #ffcc02;
                }

                .batch-status.full {
                    background-color: #ffebee;
                    border-color: #f44336;
                }

                .batch-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .batch-number {
                    font-weight: bold;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    color: white;
                }

                .batch-1 { background-color: #1976d2; }
                .batch-2 { background-color: #7b1fa2; }
                .batch-3 { background-color: #388e3c; }
                .batch-4 { background-color: #f57c00; }

                .batch-status-text {
                    font-size: 14px;
                    font-weight: 500;
                }

                .batch-status-text.upcoming { color: #1565c0; }
                .batch-status-text.active { color: #2e7d32; }
                .batch-status-text.completed { color: #757575; }

                .batch-details {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .batch-date {
                    font-size: 13px;
                    color: #666;
                }

                .batch-enrollment {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .enrollment-count {
                    font-size: 13px;
                    font-weight: 500;
                }

                .enrollment-count.nearly-full {
                    color: #f57c00;
                }

                .enrollment-count.full {
                    color: #d32f2f;
                }

                .full-badge, .nearly-full-badge {
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .full-badge {
                    background-color: #f44336;
                    color: white;
                }

                .nearly-full-badge {
                    background-color: #ff9800;
                    color: white;
                }

                .batch-info.detailed {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 16px;
                }

                .batch-header h4 {
                    margin: 0 0 16px 0;
                    color: #333;
                }

                .batch-detail {
                    margin-bottom: 16px;
                    padding: 12px;
                    border-radius: 6px;
                    border: 1px solid #e0e0e0;
                }

                .batch-detail.upcoming { background-color: #f8f9ff; }
                .batch-detail.active { background-color: #f8fff8; }
                .batch-detail.completed { background-color: #f8f8f8; }

                .capacity-bar {
                    width: 100%;
                    height: 6px;
                    background-color: #e0e0e0;
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 8px 0 4px 0;
                }

                .capacity-fill {
                    height: 100%;
                    background-color: #4caf50;
                    transition: width 0.3s ease;
                }

                .capacity-fill.nearly-full { background-color: #ff9800; }
                .capacity-fill.full { background-color: #f44336; }

                .capacity-text {
                    font-size: 12px;
                    color: #666;
                }

                .class-links {
                    margin-top: 12px;
                }

                .class-links h5 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    color: #333;
                }

                .links-grid {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .class-link {
                    display: inline-block;
                    padding: 6px 10px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .class-link.zoom {
                    background-color: #2d8cff;
                    color: white;
                }

                .class-link.discord {
                    background-color: #5865f2;
                    color: white;
                }

                .class-link.materials {
                    background-color: #6c757d;
                    color: white;
                }

                .class-link:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .batch-status.legacy {
                    background-color: #f5f5f5;
                    border-color: #d0d0d0;
                }

                .batch-label {
                    font-weight: 500;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default BatchInfo;
