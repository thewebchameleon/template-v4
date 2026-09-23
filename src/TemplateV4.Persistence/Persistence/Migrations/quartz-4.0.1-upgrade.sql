SET LOCAL search_path TO quartz;

ALTER TABLE qrtz_triggers
    ADD COLUMN IF NOT EXISTS retry_policy VARCHAR(250) NULL,
    ADD COLUMN IF NOT EXISTS retry_attempt INTEGER NULL;

CREATE TABLE IF NOT EXISTS qrtz_paused_job_grps
(
    sched_name TEXT NOT NULL,
    job_group TEXT NOT NULL,
    PRIMARY KEY (sched_name, job_group)
);

DROP INDEX IF EXISTS idx_qrtz_t_nft_st;
CREATE INDEX idx_qrtz_t_nft_st
    ON qrtz_triggers (sched_name, trigger_state, next_fire_time ASC, priority DESC, misfire_instr);

SET LOCAL search_path TO public;
